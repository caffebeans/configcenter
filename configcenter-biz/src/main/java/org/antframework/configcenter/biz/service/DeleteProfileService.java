/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 15:40 创建
 */
package org.antframework.configcenter.biz.service;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.BizException;
import org.antframework.common.util.facade.CommonResultCode;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.common.util.facade.Status;
import org.antframework.configcenter.biz.util.Apps;
import org.antframework.configcenter.biz.util.Branches;
import org.antframework.configcenter.dal.dao.ProfileDao;
import org.antframework.configcenter.dal.entity.Profile;
import org.antframework.configcenter.facade.info.AppInfo;
import org.antframework.configcenter.facade.info.BranchInfo;
import org.antframework.configcenter.facade.order.DeleteProfileOrder;
import org.bekit.service.annotation.service.Service;
import org.bekit.service.annotation.service.ServiceExecute;
import org.bekit.service.engine.ServiceContext;

/**
 * 删除环境服务
 */
@Service(enableTx = true)
@AllArgsConstructor
public class DeleteProfileService {
    // 环境dao
    private final ProfileDao profileDao;

    @ServiceExecute
    public void execute(ServiceContext<DeleteProfileOrder, EmptyResult> context) {
        DeleteProfileOrder order = context.getOrder();

        Profile profile = profileDao.findLockByProfileId(order.getProfileId());
        if (profile == null) {
            return;
        }
        if (profileDao.existsByParent(order.getProfileId())) {
            throw new BizException(Status.FAIL, CommonResultCode.ILLEGAL_STATE.getCode(), String.format("环境[%s]存在子环境，不能删除", order.getProfileId()));
        }
        // 删除所有应用在该环境下的所有分支
        for (AppInfo app : Apps.findAllApps()) {
            for (BranchInfo branch : Branches.findBranches(app.getAppId(), order.getProfileId())) {
                Branches.deleteBranch(app.getAppId(), order.getProfileId(), branch.getBranchId());
            }
        }
        // 删除环境
        profileDao.delete(profile);
    }
}
