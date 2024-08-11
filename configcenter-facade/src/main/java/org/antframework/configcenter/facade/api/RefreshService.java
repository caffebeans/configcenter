/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-16 13:44 创建
 */
package org.antframework.configcenter.facade.api;

import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.order.RefreshClientsOrder;

/**
 * 刷新服务
 */
public interface RefreshService {
    /**
     * 刷新客户端
     */
    EmptyResult refreshClients(RefreshClientsOrder order);
}
