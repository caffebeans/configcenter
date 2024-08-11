/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2018-08-19 00:13 创建
 */
package org.antframework.configcenter.client;

import org.antframework.common.util.file.MapFile;
import org.antframework.configcenter.client.core.ConfigProperties;
import org.antframework.configcenter.client.core.ConfigurableConfigProperties;
import org.antframework.configcenter.client.core.DefaultConfigProperties;
import org.antframework.configcenter.client.support.ConfigListeners;
import org.antframework.configcenter.client.support.ConfigRefresher;
import org.antframework.configcenter.client.support.ServerRequester;

import java.io.File;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 配置
 */
public class Config {
    // 应用id
    private final String appId;
    // 版本
    private final AtomicLong version;
    // 配置集
    private final ConfigurableConfigProperties properties;
    // 配置监听器的管理器
    private final ConfigListeners listeners;
    // 配置刷新器
    private final ConfigRefresher configRefresher;

    public Config(String appId, ServerRequester serverRequester, String cacheDirPath) {
        this.appId = appId;
        version = new AtomicLong(0);
        properties = new DefaultConfigProperties();
        listeners = new ConfigListeners();
        configRefresher = new ConfigRefresher(
                appId,
                version,
                properties,
                listeners,
                serverRequester,
                buildCacheFile(cacheDirPath, appId));
        configRefresher.initConfig();
    }

    // 构建缓存文件
    private MapFile buildCacheFile(String cacheDirPath, String appId) {
        if (cacheDirPath == null) {
            return null;
        }
        String cacheFilePath = cacheDirPath + File.separator + String.format("%s.properties", appId);
        return new MapFile(cacheFilePath);
    }

    /**
     * 获取应用id
     */
    public String getAppId() {
        return appId;
    }

    /**
     * 获取配置版本
     */
    public long getVersion() {
        return version.get();
    }

    /**
     * 获取配置集
     */
    public ConfigProperties getProperties() {
        return properties;
    }

    /**
     * 获取配置监听器的管理器
     */
    public ConfigListeners getListeners() {
        return listeners;
    }

    /**
     * 刷新配置（同步）
     */
    public void refresh() {
        configRefresher.refresh();
    }
}
