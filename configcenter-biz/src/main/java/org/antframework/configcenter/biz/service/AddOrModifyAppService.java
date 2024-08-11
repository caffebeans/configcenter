/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 15:05 创建
 */
package org.antframework.configcenter.biz.service;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.BizException;
import org.antframework.common.util.facade.CommonResultCode;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.common.util.facade.Status;
import org.antframework.configcenter.biz.util.Branches;
import org.antframework.configcenter.biz.util.Profiles;
import org.antframework.configcenter.biz.util.Refreshes;
import org.antframework.configcenter.dal.dao.AppDao;
import org.antframework.configcenter.dal.dao.ProfileDao;
import org.antframework.configcenter.dal.dao.PropertyValueDao;
import org.antframework.configcenter.dal.entity.App;
import org.antframework.configcenter.dal.entity.Profile;
import org.antframework.configcenter.dal.entity.PropertyValue;
import org.antframework.configcenter.facade.info.BranchInfo;
import org.antframework.configcenter.facade.info.ProfileInfo;
import org.antframework.configcenter.facade.order.AddOrModifyAppOrder;
import org.antframework.configcenter.facade.vo.BranchConstants;
import org.antframework.configcenter.facade.vo.ReleaseConstant;
import org.apache.commons.lang3.StringUtils;
import org.bekit.service.annotation.service.Service;
import org.bekit.service.annotation.service.ServiceAfter;
import org.bekit.service.annotation.service.ServiceExecute;
import org.bekit.service.engine.ServiceContext;
import org.springframework.beans.BeanUtils;

import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * 添加或修改应用服务
 */
@Service(enableTx = true)
@AllArgsConstructor
public class AddOrModifyAppService {
    // 应用dao
    private final AppDao appDao;

    private final PropertyValueDao profileValuesDao;
    private final PropertyValueDao propertyValueDao;

    @ServiceExecute
    public void execute(ServiceContext<AddOrModifyAppOrder, EmptyResult> context) {
        AddOrModifyAppOrder order = context.getOrder();
        // 校验是否出现循环继承和祖先是否存在
        checkCycleAndAncestors(order.getAppId(), order.getParent());
        // 新增或修改应用
        App app = appDao.findLockByAppId(order.getAppId());
        if (app == null) {
            app = new App();
            app.setReleaseVersion(ReleaseConstant.ORIGIN_VERSION);    //它的初始版本的是0
            //说明需要新增加一个应用，如果为空，说明是需要新增应用的。它的父级应用id为空
            if(!StringUtils.isEmpty(order.getParent())){
                   //拿到所有的父容器的环境变量
                List<PropertyValue> master = profileValuesDao.findAllProfilesByParentId(order.getParent(), "master", BranchConstants.DEFAULT_BRANCH_ID);
                master.forEach(propertyValue -> {
                    PropertyValue insertVo = new PropertyValue();
                    insertVo.setUpdateTime(new Date());
                    insertVo.setCreateTime(new Date());
                    insertVo.setBranchId("master");
                    insertVo.setProfileId("master");
                    insertVo.setAppId(order.getAppId());
                    insertVo.setKey(propertyValue.getKey());
                    insertVo.setValue(propertyValue.getValue());
                    insertVo.setScope(propertyValue.getScope());
                    profileValuesDao.save(insertVo);
                });
            }

        }
        BeanUtils.copyProperties(order, app);
        appDao.save(app);

        // 保证默认分支存在
        for (ProfileInfo profile : Profiles.findAllProfiles()) {
            BranchInfo branch = Branches.findBranch(order.getAppId(), profile.getProfileId(), BranchConstants.DEFAULT_BRANCH_ID);
            if (branch == null) {
                Branches.addBranch(order.getAppId(), profile.getProfileId(), BranchConstants.DEFAULT_BRANCH_ID, ReleaseConstant.ORIGIN_VERSION);
            }
        }
    }

    // 校验是否出现循环继承和祖先是否存在
    private void checkCycleAndAncestors(String appId, String parentId) {
        StringBuilder builder = new StringBuilder(appId);
        String ancestorId = parentId;
        while (ancestorId != null) {
            builder.append("-->").append(ancestorId);
            if (Objects.equals(ancestorId, appId)) {
                throw new BizException(Status.FAIL, CommonResultCode.INVALID_PARAMETER.getCode(), String.format("出现循环继承[%s]", builder.toString()));
            }
            App ancestor = appDao.findLockByAppId(ancestorId);
            if (ancestor == null) {
                throw new BizException(Status.FAIL, CommonResultCode.INVALID_PARAMETER.getCode(), String.format("不存在应用[%s]", ancestorId));
            }
            ancestorId = ancestor.getParent();
        }
    }

    @ServiceAfter
    public void after(ServiceContext<AddOrModifyAppOrder, EmptyResult> context) {
        AddOrModifyAppOrder order = context.getOrder();
        // 刷新客户端
        Refreshes.refreshClients(order.getAppId(), null);
    }
}
