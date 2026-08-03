# PostgreSQL 备份与隔离恢复演练

本 runbook 用于 Hans‘s Blog 的 PostgreSQL 逻辑备份、加密离站存储和隔离恢复验证。数据库同时保存文章、taxonomy、管理员会话和规范化 WebP 媒体字节；恢复验证必须覆盖这些数据，而不能只检查文章表。它不绑定云厂商，也不包含真实主机、域名、账号或凭据。

**写完或阅读本 runbook 不代表恢复门禁已经通过。** 公网发布前，必须在最终数据库和运行环境中完成一次有证据的演练；在此之前，[安全审计](../security/public-exposure-audit-2026-07-11.md)中的 `public_exposure: blocked_pending_provider_controls` 保持不变。该缺口属于 `T-06-39`；边缘/秘密/私有数据库供应商证据仍由 `T-06-38` 阻塞。

## 安全原则

- 应用版本回滚与数据恢复是两个独立决策。优先发布兼容的 forward-fix 迁移，不要为了回滚应用直接回退生产数据库。
- 任何破坏性恢复前都要有已校验的备份、审批记录和隔离恢复成功证据。
- 恢复始终先进入**全新、无生产流量的隔离数据库**；禁止直接把 `pg_restore` 指向生产数据库。
- 备份连接强制 TLS `verify-full`，并校验服务端证书；不能为了临时成功改成明文或跳过证书验证。
- 备份账号只有 `CONNECT`、schema `USAGE` 和所需表/sequence 的只读权限，不得拥有 DDL、角色管理或超级用户权限。
- 恢复账号只对隔离目标具有建表/写入权限；应用 smoke 使用独立、最小权限的应用账号。
- 明文 dump 只允许短暂停留在访问受限的加密临时卷，权限由 `umask 077` 约束；离站保存的工件必须加密。
- 凭据通过受控 secret manager 或权限为 `0600` 的 `PGPASSFILE` 提供，禁止放进命令行、shell history、文档、工单正文或日志。

## 前置条件与占位变量

先在变更/演练工单中确定 RPO、RTO、保留期、审批人和维护窗口。下列变量只表示字段名；实际值由受控环境注入，不要写回仓库。

| 变量 | 含义 |
| --- | --- |
| `SOURCE_DB_HOST` / `SOURCE_DB_PORT` / `SOURCE_DB_NAME` | 备份源标识 |
| `BACKUP_DB_USER` / `BACKUP_PGPASSFILE` | 只读备份身份和受限 password file |
| `PGSSLROOTCERT` | 验证数据库证书的可信 CA 文件 |
| `SECURE_TEMP_DIR` | 本机加密临时卷中的工作目录 |
| `ENCRYPTED_BACKUP` | 最终加密 dump 的本地暂存路径 |
| `DUMP_MANIFEST` | 与加密 dump 一起取回的原始 `pg_restore --list` 清单路径 |
| `BACKUP_RECIPIENT` | 已核验 fingerprint 的 GnuPG 公钥 recipient |
| `OFFSITE_OBJECT_ID` | 离站存储中的不可变对象标识，不是公开 URL |
| `RESTORE_DB_HOST` / `RESTORE_DB_PORT` / `RESTORE_DB_NAME` | 新建隔离恢复目标 |
| `RESTORE_DB_USER` / `RESTORE_PGPASSFILE` | 仅限隔离目标的恢复身份 |
| `RESTORE_APP_ORIGIN` | 私有恢复验证实例的 origin |
| `PUBLISHED_SLUG` | 备份中选定的一篇已发布文章 slug |

操作机需安装与服务端兼容的 PostgreSQL client（`psql`、`pg_dump`、`pg_restore`、`createdb`、`dropdb`）、`sha256sum` 和 GnuPG。先核对 `pg_dump --version`；client 不得早于源 PostgreSQL 的 major version。

## 一、生成加密逻辑备份

### 1. 证明连接与权限边界

使用只读备份身份连接源库，并确认当前连接启用了 TLS：

```bash
PGHOST="$SOURCE_DB_HOST" \
PGPORT="$SOURCE_DB_PORT" \
PGDATABASE="$SOURCE_DB_NAME" \
PGUSER="$BACKUP_DB_USER" \
PGPASSFILE="$BACKUP_PGPASSFILE" \
PGSSLMODE=verify-full \
PGSSLROOTCERT="$PGSSLROOTCERT" \
psql -X --set=ON_ERROR_STOP=1 --command="SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid();"
```

结果必须为 `t`。随后用同一身份验证可读取应用 schema，但不能创建表、修改数据或管理角色。权限过宽或 TLS 校验失败时立即停止并修正配置，不得继续备份。

### 2. 创建 custom-format dump

在加密临时卷内创建本次工件。不要使用仓库目录或共享 `/tmp`：

```bash
umask 077
BACKUP_ID="$(date -u +%Y%m%dT%H%M%SZ)"
PLAIN_BACKUP="$SECURE_TEMP_DIR/personal-blog-$BACKUP_ID.dump"
DUMP_MANIFEST="$SECURE_TEMP_DIR/personal-blog-$BACKUP_ID.list"

PGHOST="$SOURCE_DB_HOST" \
PGPORT="$SOURCE_DB_PORT" \
PGDATABASE="$SOURCE_DB_NAME" \
PGUSER="$BACKUP_DB_USER" \
PGPASSFILE="$BACKUP_PGPASSFILE" \
PGSSLMODE=verify-full \
PGSSLROOTCERT="$PGSSLROOTCERT" \
pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="$PLAIN_BACKUP"

pg_restore --list "$PLAIN_BACKUP" > "$DUMP_MANIFEST"
test -s "$PLAIN_BACKUP"
test -s "$DUMP_MANIFEST"
```

`pg_dump` 的一致性快照不会锁住普通读写，但操作员仍应监控源库负载和失败日志。custom format 不包含 PostgreSQL 全局角色；恢复所需角色由隔离环境单独、最小权限地创建。

### 3. 加密、校验并离站保存

先核对 `BACKUP_RECIPIENT` 的公钥 fingerprint，再使用公钥加密。不要把私钥或解密口令放在备份主机：

```bash
gpg --batch \
  --recipient "$BACKUP_RECIPIENT" \
  --output "$ENCRYPTED_BACKUP" \
  --encrypt "$PLAIN_BACKUP"

sha256sum "$ENCRYPTED_BACKUP" > "$ENCRYPTED_BACKUP.sha256"
sha256sum --check "$ENCRYPTED_BACKUP.sha256"
gpg --batch --decrypt "$ENCRYPTED_BACKUP" | cmp - "$PLAIN_BACKUP"
```

只有三项命令全部成功后，才能接受该工件。将以下内容通过受控传输保存到与生产数据库不同故障域的加密离站存储：

- 加密 dump；
- SHA-256 checksum 文件；
- 受限访问的 dump manifest 和本次证据记录；
- 保留期、到期时间、对象不可变/版本保护状态和授权主体清单。

离站对象必须默认拒绝公开访问，限制读取/删除权限，启用访问审计，并按批准的保留策略轮换。传输完成后重新下载一次到新的受限目录并运行 `sha256sum --check`，证明存储与取回链路没有篡改。

确认离站对象、checksum 和证据均可读取后，删除加密临时卷中的明文 dump；同时清除 shell 变量和受控临时文件。不要把 `shred` 当作 SSD/云盘上的可靠保证，核心控制是加密卷、短生命周期和销毁卷密钥。

## 二、恢复到全新隔离数据库

### 1. 取回并验证工件

由与备份审批相分离的操作员，从离站存储取回加密 dump、checksum 和 manifest。先验证对象标识、时间、来源、保留状态，再验证 checksum：

```bash
sha256sum --check "$ENCRYPTED_BACKUP.sha256"
```

checksum 不匹配时，立即隔离工件并升级安全/数据库事件；禁止解密、恢复或用另一个未登记工件临时替代。

在新的加密临时卷解密并比较 manifest：

```bash
umask 077
RESTORE_DUMP="$SECURE_TEMP_DIR/restore-$BACKUP_ID.dump"
RESTORE_MANIFEST="$SECURE_TEMP_DIR/restore-$BACKUP_ID.list"

gpg --batch --output "$RESTORE_DUMP" --decrypt "$ENCRYPTED_BACKUP"
pg_restore --list "$RESTORE_DUMP" > "$RESTORE_MANIFEST"
cmp "$DUMP_MANIFEST" "$RESTORE_MANIFEST"
```

### 2. 创建隔离目标并恢复

隔离目标必须没有生产 DNS、生产流量或生产写入权限。至少要求数据库名与源库不同，并在执行前人工核对主机/项目/网络标识：

```bash
test "$RESTORE_ENVIRONMENT" = "isolated-drill"
test "$RESTORE_DB_NAME" != "$SOURCE_DB_NAME"

PGHOST="$RESTORE_DB_HOST" \
PGPORT="$RESTORE_DB_PORT" \
PGUSER="$RESTORE_DB_USER" \
PGPASSFILE="$RESTORE_PGPASSFILE" \
PGSSLMODE=verify-full \
PGSSLROOTCERT="$PGSSLROOTCERT" \
createdb --maintenance-db=postgres --template=template0 "$RESTORE_DB_NAME"

PGHOST="$RESTORE_DB_HOST" \
PGPORT="$RESTORE_DB_PORT" \
PGDATABASE="$RESTORE_DB_NAME" \
PGUSER="$RESTORE_DB_USER" \
PGPASSFILE="$RESTORE_PGPASSFILE" \
PGSSLMODE=verify-full \
PGSSLROOTCERT="$PGSSLROOTCERT" \
pg_restore \
  --exit-on-error \
  --single-transaction \
  --no-owner \
  --no-privileges \
  --dbname="$RESTORE_DB_NAME" \
  "$RESTORE_DUMP"
```

新目标不使用 `--clean`、`--create` 或覆盖现有数据库的参数。任何主机、数据库名或环境标签与生产目标相同，都必须 fail closed 并由另一名操作员复核。

### 3. 验证 schema 与内容

先记录只读基线，不打印文章正文、session token hash 或管理员敏感字段：

```bash
PGHOST="$RESTORE_DB_HOST" \
PGPORT="$RESTORE_DB_PORT" \
PGDATABASE="$RESTORE_DB_NAME" \
PGUSER="$RESTORE_DB_USER" \
PGPASSFILE="$RESTORE_PGPASSFILE" \
PGSSLMODE=verify-full \
PGSSLROOTCERT="$PGSSLROOTCERT" \
psql -X --set=ON_ERROR_STOP=1 \
  --command='SELECT count(*) AS migration_count FROM "_prisma_migrations";' \
  --command='SELECT status, count(*) FROM "Post" GROUP BY status ORDER BY status;' \
  --command='SELECT count(*) AS media_count, COALESCE(sum("byteLength"), 0) AS media_bytes, count(*) FILTER (WHERE "publicAt" IS NOT NULL) AS public_media_count FROM "MediaAsset";'
```

把隔离数据库连接通过临时 secret 注入为该终端的 `DATABASE_URL`，不要把连接串写入命令、文档或仓库。然后从已批准的应用提交运行：

```bash
npm ci
npm run db:validate
npm run db:migrate:deploy
npm run db:generate
```

`db:migrate:deploy` 只能把已提交的 forward migrations 应用到隔离目标。命令失败时不得修改迁移历史或转向生产恢复；保存错误和 `_prisma_migrations` 状态用于调查。

### 4. 应用与登录 smoke

基线记录完成后，为隔离应用注入 drill-only 的 `ADMIN_EMAIL`、`ADMIN_PASSWORD_HASH`、`ADMIN_SESSION_SECRET` 和匹配的 `PLAYWRIGHT_ADMIN_PASSWORD`，再运行幂等 bootstrap。不要复用、导出或记录生产管理员明文密码：

```bash
npm run admin:bootstrap
npm run build
```

在无公网入口的隔离运行环境启动应用，并验证：

```bash
curl --fail --silent --show-error "$RESTORE_APP_ORIGIN/api/health"
curl --fail --silent --show-error "$RESTORE_APP_ORIGIN/api/health/ready"
curl --fail --silent --show-error "$RESTORE_APP_ORIGIN/notes"
curl --fail --silent --show-error "$RESTORE_APP_ORIGIN/notes/$PUBLISHED_SLUG"
xvfb-run --auto-servernum npm run security:smoke
```

通过标准：

- `/api/health` 返回进程 liveness；
- `/api/health/ready` 返回 `200 {"status":"ready"}`，而不是仅凭 liveness 判定数据库可用；
- `/notes` 和选定的已发布文章可以读取，草稿不出现在公开面；
- `MediaAsset` 总数、总字节数与公开媒体数符合备份证据；至少一项已发布文章引用的站内媒体可匿名读取，私有媒体仍要求管理员且不会进入共享缓存；
- `security:smoke` 的管理员登录与 POST 退出、安全头、受保护路由和生产诊断路由检查全部通过；
- 关键表数量与备份证据一致，迁移无 failed 状态，应用日志没有数据库或 5xx 异常。

`security:smoke` 会自行在 loopback 启动 `next start`；它证明恢复数据可供应用读取和管理员认证，但不替代最终公网域名、WAF、TLS 或供应商网络测试。

## 三、记录证据与清理

每次备份/恢复演练至少记录以下字段；敏感标识做最小化或脱敏，但不能删除审计关联：

| 字段 | 记录内容 |
| --- | --- |
| 变更/演练 ID | 审批工单和目的 |
| 时间与操作员 | UTC 开始/结束时间、主操作员、复核人 |
| 源标识 | 数据库环境/实例的非敏感 ID、PostgreSQL server version |
| 工具版本 | `pg_dump`、`pg_restore`、应用 commit |
| 备份工件 | `OFFSITE_OBJECT_ID`、字节数、加密 recipient fingerprint、保留到期时间 |
| 完整性 | SHA-256 algorithm/value、上传前和下载后校验结果 |
| 隔离目标 | 非生产项目/网络/数据库 ID，以及与生产隔离的证明 |
| 恢复结果 | `pg_restore`、Prisma validate/migrate、关键行数对比 |
| 应用 smoke | liveness、readiness、公开文章/站内媒体读取、私有媒体隔离、管理员登录/退出的结果 |
| 恢复指标 | 实际恢复点、数据新鲜度、总耗时，与批准 RPO/RTO 的比较 |
| 清理 | 应用停止、临时秘密撤销、隔离数据库/卷销毁和复核结果 |
| 最终判定 | PASS/FAIL、未解决问题、负责人和截止时间 |

证据必须进入受控审计存储，不能包含连接串、密码、session token、完整文章正文或可下载备份的公开 URL。应用目前没有覆盖上传、媒体曝光、文章编辑/删除的持久化安全审计事件（非阻塞 `T-06-41`），因此外部工单、数据库/平台日志和本 runbook 证据链不能由普通 mutation 响应或模型时间戳替代。

完成取证后按以下顺序清理：

1. 停止隔离应用并确认没有流量或后台任务。
2. 撤销 drill-only 管理员、session、数据库和解密凭据。
3. 删除解密 dump 和临时 manifest，销毁加密临时卷或其密钥。
4. 由第二名操作员确认目标确实标记为 `isolated-drill`、数据库名不等于源库，再删除隔离数据库：

```bash
test "$RESTORE_ENVIRONMENT" = "isolated-drill"
test "$RESTORE_DB_NAME" != "$SOURCE_DB_NAME"

PGHOST="$RESTORE_DB_HOST" \
PGPORT="$RESTORE_DB_PORT" \
PGUSER="$RESTORE_DB_USER" \
PGPASSFILE="$RESTORE_PGPASSFILE" \
PGSSLMODE=verify-full \
PGSSLROOTCERT="$PGSSLROOTCERT" \
dropdb --maintenance-db=postgres --if-exists "$RESTORE_DB_NAME"
```

5. 验证生产数据库和生产应用未发生任何变更，关闭演练工单并记录清理复核人。

`dropdb` 只允许用于已核验的隔离目标；不要复制该命令到生产会话。

## 失败处理与升级

- **TLS、身份或权限失败：** 停止，不降低 TLS/证书校验、不扩大角色权限；交由数据库/安全负责人修正。
- **checksum 或 manifest 不一致：** 隔离工件并按潜在篡改/损坏事件处理；不得继续恢复。
- **`pg_dump` 失败：** 保留非敏感错误、检查源负载和 client/server 兼容性；本次工件标记 FAIL，不上传半成品。
- **`pg_restore` 失败：** 保留日志，销毁失败的隔离目标；调查后只能从同一已验证工件重新创建全新目标。
- **迁移失败：** 不编辑已应用迁移、不执行 reset；优先准备新的 forward-fix，并在另一个全新隔离目标重演。
- **readiness、公开读取或管理员登录失败：** 恢复演练判定 FAIL，公网门禁继续阻塞；记录负责人、修复和重演日期。
- **发现目标可能是生产：** 立即中止所有命令并升级为高优先级事件；先证明未产生写入，再决定后续动作。

## 生产恢复决策

只有在 forward-fix 和兼容应用回滚都不可行、业务负责人批准恢复点、已核对数据损失窗口，并且上述隔离演练对同一工件完整通过后，才能单独制定生产恢复变更。生产恢复必须包含维护窗口、流量隔离、最终备份、双人复核、逐步 smoke、回退点和沟通计划；本 runbook 不自动授权该操作。

## 执行频率

- 按业务批准的 RPO 自动生成和监控备份；每次关键 schema 变更前额外生成并校验一次备份。
- 至少每季度执行一次端到端隔离恢复演练；数据库、加密、存储或运行供应商发生重大变化后立即重演。
- 每月抽查离站对象的访问控制、保留期、不可变状态和下载后 checksum。
- 每次演练失败后，修复完成必须重新执行全流程，不能只补写 PASS 记录。

公网发布需要最终供应商环境中的新鲜 PASS 证据。只有 `T-06-38` 的边缘/秘密/私有数据库证据和 `T-06-39` 的恢复/监控/事件响应证据都关闭后才能放行；仓库中的示例命令、CI 成功或本地应用审计都不能替代该证据。
