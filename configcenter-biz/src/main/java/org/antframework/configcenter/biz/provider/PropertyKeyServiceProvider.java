/*
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 20:39 创建
 */
package org.antframework.configcenter.biz.provider;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.api.PropertyKeyService;
import org.antframework.configcenter.facade.order.AddOrModifyPropertyKeyOrder;
import org.antframework.configcenter.facade.order.DeletePropertyKeyOrder;
import org.antframework.configcenter.facade.order.FindInheritedAppPropertyKeysOrder;
import org.antframework.configcenter.facade.order.FindPropertyKeysOrder;
import org.antframework.configcenter.facade.result.FindInheritedAppPropertyKeysResult;
import org.antframework.configcenter.facade.result.FindPropertyKeysResult;
import org.bekit.service.ServiceEngine;
import org.springframework.stereotype.Service;

/**
 * 配置key服务提供者
 */
@Service
@AllArgsConstructor
public class PropertyKeyServiceProvider implements PropertyKeyService {
    // 服务引擎
    private final ServiceEngine serviceEngine;

    @Override
    public EmptyResult addOrModifyPropertyKey(AddOrModifyPropertyKeyOrder order) {
        return serviceEngine.execute("addOrModifyPropertyKeyService", order);
    }

    @Override
    public EmptyResult deletePropertyKey(DeletePropertyKeyOrder order) {
        return serviceEngine.execute("deletePropertyKeyService", order);
    }

    @Override
    public FindPropertyKeysResult findPropertyKeys(FindPropertyKeysOrder order) {
        return serviceEngine.execute("findPropertyKeysService", order);
    }

    @Override
    public FindInheritedAppPropertyKeysResult findInheritedAppPropertyKeys(FindInheritedAppPropertyKeysOrder order) {
        return serviceEngine.execute("findInheritedAppPropertyKeysService", order);
    }
}
