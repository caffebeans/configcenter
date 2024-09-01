/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2018-12-08 22:42 创建
 */
package org.antframework.configcenter.biz.service;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.BizException;
import org.antframework.common.util.facade.CommonResultCode;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.common.util.facade.Status;
import org.antframework.configcenter.dal.dao.BranchDao;
import org.antframework.configcenter.dal.dao.PropertyValueDao;
import org.antframework.configcenter.dal.dao.SysLogMapper;
import org.antframework.configcenter.dal.entity.Branch;
import org.antframework.configcenter.dal.entity.PropertyValue;
import org.antframework.configcenter.dal.entity.SysLogDo;
import org.antframework.configcenter.facade.order.AddOrModifyPropertyValueOrder;
import org.antframework.manager.facade.info.ManagerInfo;
import org.antframework.manager.web.CurrentManagerAssert;
import org.bekit.service.annotation.service.Service;
import org.bekit.service.annotation.service.ServiceExecute;
import org.bekit.service.engine.ServiceContext;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;

/**
 * 新增或删除配置value服务
 */
@Service(enableTx = true)
@AllArgsConstructor
public class AddOrModifyPropertyValueService {
    // 分支dao
    private final BranchDao branchDao;
    // 配置value dao
    private final PropertyValueDao propertyValueDao;

    @Autowired
    private SysLogMapper mapper;

    @ServiceExecute
    public void execute(ServiceContext<AddOrModifyPropertyValueOrder, EmptyResult> context) {
        AddOrModifyPropertyValueOrder order = context.getOrder();
        // 校验入参
        Branch branch = branchDao.findLockByAppIdAndProfileIdAndBranchId(order.getAppId(), order.getProfileId(), order.getBranchId());
        if (branch == null) {
            throw new BizException(Status.FAIL, CommonResultCode.INVALID_PARAMETER.getCode(), String.format("分支[appId=%s,profileId=%s,branchId=%s]不存在", order.getAppId(), order.getProfileId(), order.getBranchId()));
        }
        // 新增或修改配置value
        PropertyValue propertyValue = propertyValueDao.findLockByAppIdAndProfileIdAndBranchIdAndKey(order.getAppId(), order.getProfileId(), order.getBranchId(), order.getKey());
        SysLogDo sysLog = new SysLogDo();
        if (propertyValue == null) {
            propertyValue = new PropertyValue();
            sysLog.setOldValue(order.getValue());
            sysLog.setNewValue(order.getValue());
        }else {
            sysLog.setOldValue(propertyValue.getValue());
            sysLog.setNewValue(order.getValue());
        }

        BeanUtils.copyProperties(order, propertyValue);

        //开始添加操作日志
        sysLog.setAppId(order.getAppId());
        sysLog.setBranchId(order.getBranchId());
        sysLog.setProfileId(order.getProfileId());
        sysLog.setPropertyKey(order.getKey());
        sysLog.setUpdateTime(new Date());
        //获取当前用户
        ManagerInfo manager = CurrentManagerAssert.current();
        String name = manager.getName();
        sysLog.setUpdatedBy(name);
        mapper.insert(sysLog);
        propertyValueDao.save(propertyValue);
    }
}
