/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 21:03 创建
 */
package org.antframework.configcenter.biz.provider;

import cn.hutool.core.date.DateTime;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.date.LocalDateTimeUtil;
import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.dal.dao.PropertyValueDao;
import org.antframework.configcenter.dal.entity.PropertyValue;
import org.antframework.configcenter.facade.api.PropertyValueService;
import org.antframework.configcenter.facade.info.PropertyValueInfo;
import org.antframework.configcenter.facade.order.*;
import org.antframework.configcenter.facade.result.FindPropertyValuesResult;
import org.bekit.service.ServiceEngine;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

/**
 * 配置value服务提供者
 */
@Service
@AllArgsConstructor
public class PropertyValueServiceProvider implements PropertyValueService {
    // 服务引擎
    private final ServiceEngine serviceEngine;

    private PropertyValueDao propertyValueDao;

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

    @Override
    public FindPropertyValuesResult comparePropertyValues(ComparePropertyValuesOrder order) {

        List<PropertyValue> byKey = propertyValueDao.findByKey(order.getKey());
        FindPropertyValuesResult res = new FindPropertyValuesResult();
        byKey.forEach(propertyValue -> {
            PropertyValueInfo temp = new PropertyValueInfo();
            BeanUtils.copyProperties(propertyValue,temp);
// 将 temp 对象添加到结果集中
            res.addPropertyValue(temp);
        });
        res.setCode("200");
        return  res;
    }
}
