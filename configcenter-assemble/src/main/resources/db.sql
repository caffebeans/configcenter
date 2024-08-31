-- ----------------------------
--  Table structure for `App`
-- ----------------------------
create database  configcenter;

use configcenter;

CREATE TABLE `App` (
                       `id` bigint(20) NOT NULL AUTO_INCREMENT,
                       `createTime` datetime DEFAULT NULL,
                       `updateTime` datetime DEFAULT NULL,
                       `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                       `appName` varchar(255) COLLATE utf8_bin DEFAULT NULL,
                       `parent` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                       `releaseVersion` bigint(20) DEFAULT NULL,
                       PRIMARY KEY (`id`),
                       UNIQUE KEY `uk_appId` (`appId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `Branch`
-- ----------------------------
CREATE TABLE `Branch` (
                          `id` bigint(20) NOT NULL AUTO_INCREMENT,
                          `createTime` datetime DEFAULT NULL,
                          `updateTime` datetime DEFAULT NULL,
                          `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                          `branchId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                          `profileId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                          `releaseVersion` bigint(20) DEFAULT NULL,
                          PRIMARY KEY (`id`),
                          UNIQUE KEY `uk_appId_profileId_branchId` (`appId`,`profileId`,`branchId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `BranchRule`
-- ----------------------------
CREATE TABLE `BranchRule` (
                              `id` bigint(20) NOT NULL AUTO_INCREMENT,
                              `createTime` datetime DEFAULT NULL,
                              `updateTime` datetime DEFAULT NULL,
                              `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                              `branchId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                              `priority` bigint(20) DEFAULT NULL,
                              `profileId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                              `rule` varchar(255) COLLATE utf8_bin DEFAULT NULL,
                              PRIMARY KEY (`id`),
                              UNIQUE KEY `uk_appId_profileId_branchId` (`appId`,`profileId`,`branchId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `Manager`
-- ----------------------------
CREATE TABLE `Manager` (
                           `id` bigint(20) NOT NULL AUTO_INCREMENT,
                           `createTime` datetime DEFAULT NULL,
                           `updateTime` datetime DEFAULT NULL,
                           `managerId` varchar(128) COLLATE utf8_bin DEFAULT NULL,
                           `name` varchar(255) COLLATE utf8_bin DEFAULT NULL,
                           `password` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           `secretKey` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           `type` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `uk_managerId` (`managerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `Mergence`
-- ----------------------------
CREATE TABLE `Mergence` (
                            `id` bigint(20) NOT NULL AUTO_INCREMENT,
                            `createTime` datetime DEFAULT NULL,
                            `updateTime` datetime DEFAULT NULL,
                            `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                            `profileId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                            `releaseVersion` bigint(20) DEFAULT NULL,
                            `sourceReleaseVersion` bigint(20) DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `uk_appId_profileId_releaseVersion` (`appId`,`profileId`,`releaseVersion`),
                            KEY `idx_appId_profileId_sourceReleaseVersion` (`appId`,`profileId`,`sourceReleaseVersion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `Profile`
-- ----------------------------
CREATE TABLE `Profile` (
                           `id` bigint(20) NOT NULL AUTO_INCREMENT,
                           `createTime` datetime DEFAULT NULL,
                           `updateTime` datetime DEFAULT NULL,
                           `parent` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           `profileId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           `profileName` varchar(255) COLLATE utf8_bin DEFAULT NULL,
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `uk_profileId` (`profileId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `PropertyKey`
-- ----------------------------
CREATE TABLE `PropertyKey` (
                               `id` bigint(20) NOT NULL AUTO_INCREMENT,
                               `createTime` datetime DEFAULT NULL,
                               `updateTime` datetime DEFAULT NULL,
                               `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                               `key` varchar(128) COLLATE utf8_bin DEFAULT NULL,
                               `memo` varchar(255) COLLATE utf8_bin DEFAULT NULL,
                               `scope` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               UNIQUE KEY `uk_appId_key` (`appId`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `PropertyValue`
-- ----------------------------
CREATE TABLE `PropertyValue` (
                                 `id` bigint(20) NOT NULL AUTO_INCREMENT,
                                 `createTime` datetime DEFAULT NULL,
                                 `updateTime` datetime DEFAULT NULL,
                                 `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                                 `branchId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                                 `key` varchar(128) COLLATE utf8_bin DEFAULT NULL,
                                 `profileId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                                 `scope` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                                 `value` longtext COLLATE utf8_bin,
                                 PRIMARY KEY (`id`),
                                 UNIQUE KEY `uk_appId_profileId_branchId_key` (`appId`,`profileId`,`branchId`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `Relation`
-- ----------------------------
CREATE TABLE `Relation` (
                            `id` bigint(20) NOT NULL AUTO_INCREMENT,
                            `createTime` datetime DEFAULT NULL,
                            `updateTime` datetime DEFAULT NULL,
                            `source` varchar(128) COLLATE utf8_bin DEFAULT NULL,
                            `target` varchar(128) COLLATE utf8_bin DEFAULT NULL,
                            `type` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                            `value` varchar(2048) COLLATE utf8_bin DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `uk_type_source_target` (`type`,`source`,`target`),
                            KEY `idx_type_source` (`type`,`source`),
                            KEY `idx_type_target` (`type`,`target`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ----------------------------
--  Table structure for `Release`
-- ----------------------------
CREATE TABLE `Release` (
                           `id` bigint(20) NOT NULL AUTO_INCREMENT,
                           `createTime` datetime DEFAULT NULL,
                           `updateTime` datetime DEFAULT NULL,
                           `appId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           `memo` varchar(255) COLLATE utf8_bin DEFAULT NULL,
                           `parentVersion` bigint(20) DEFAULT NULL,
                           `profileId` varchar(64) COLLATE utf8_bin DEFAULT NULL,
                           `properties` longtext COLLATE utf8_bin,
                           `releaseTime` datetime DEFAULT NULL,
                           `version` bigint(20) DEFAULT NULL,
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `uk_appId_profileId_version` (`appId`,`profileId`,`version`),
                           KEY `idx_appId_profileId_parentVersion` (`appId`,`profileId`,`parentVersion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


# 操作日志表
CREATE TABLE `sys_log` (
                                          `id` bigint NOT NULL AUTO_INCREMENT,
                                          `propertyValueId` bigint NOT NULL,
                                          `appId` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                          `profileId` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                          `branchId` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                          `oldKey` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                          `newKey` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                          `updateTime` datetime DEFAULT CURRENT_TIMESTAMP,
                                          `updatedBy` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
                                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

