/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-22 15:48 创建
 */
package org.antframework.configcenter;

import org.antframework.boot.lang.AntBootApplication;
import org.antframework.boot.lang.Apps;
import org.springframework.boot.SpringApplication;

/**
 * 程序启动入口
 */
@AntBootApplication(appId = "configcenter")
public class Main {
    public static void main(String[] args) {
        Apps.setProfileIfAbsent("dev");
        SpringApplication.run(Main.class, args);
    }
}
