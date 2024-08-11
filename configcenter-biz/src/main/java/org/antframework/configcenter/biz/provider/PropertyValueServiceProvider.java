/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 21:03 创建
 */
package org.antframework.configcenter.biz.provider;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.api.PropertyValueService;
import org.antframework.configcenter.facade.order.AddOrModifyPropertyValueOrder;
import org.antframework.configcenter.facade.order.DeletePropertyValueOrder;
import org.antframework.configcenter.facade.order.FindPropertyValuesOrder;
import org.antframework.configcenter.facade.order.RevertPropertyValuesOrder;
import org.antframework.configcenter.facade.result.FindPropertyValuesResult;
import org.bekit.service.ServiceEngine;
import org.springframework.stereotype.Service;

/**
 * 配置value服务提供者
 */
@Service
@AllArgsConstructor
public class PropertyValueServiceProvider implements PropertyValueService {
    // 服务引擎
    private final ServiceEngine serviceEngine;

    @Override
    public EmptyResult addOrModifyPropertyValue(AddOrModifyPropertyValueOrder order) {
        return serviceEngine.execute("addOrModifyPropertyValueService", order);
    }

    @Override
    public EmptyResult deletePropertyValue(DeletePropertyValueOrder order) {
        return serviceEngine.execute("deletePropertyValueService", order);
    }

    @Override
    public EmptyResult revertPropertyValues(RevertPropertyValuesOrder order) {
        return serviceEngine.execute("revertPropertyValuesService", order);
    }

    @Override
    public FindPropertyValuesResult findPropertyValues(FindPropertyValuesOrder order) {
        return serviceEngine.execute("findPropertyValuesService", order);
    }
}
