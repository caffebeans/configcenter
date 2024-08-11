/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2018-05-22 21:55 创建
 */
package org.antframework.configcenter.biz.service;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.BizException;
import org.antframework.common.util.facade.CommonResultCode;
import org.antframework.common.util.facade.FacadeUtils;
import org.antframework.common.util.facade.Status;
import org.antframework.configcenter.biz.util.Apps;
import org.antframework.configcenter.dal.dao.AppDao;
import org.antframework.configcenter.dal.entity.App;
import org.antframework.configcenter.facade.info.AppInfo;
import org.antframework.configcenter.facade.info.AppTree;
import org.antframework.configcenter.facade.order.FindAppTreeOrder;
import org.antframework.configcenter.facade.result.FindAppTreeResult;
import org.bekit.service.annotation.service.Service;
import org.bekit.service.annotation.service.ServiceExecute;
import org.bekit.service.engine.ServiceContext;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 * 查找应用树服务
 */
@Service
@AllArgsConstructor
public class FindAppTreeService {
    // 转换器
    private static final Converter<App, AppInfo> CONVERTER = new FacadeUtils.DefaultConverter<>(AppInfo.class);

    // 应用dao
    private final AppDao appDao;

    @ServiceExecute
    public void execute(ServiceContext<FindAppTreeOrder, FindAppTreeResult> context) {
        FindAppTreeOrder order = context.getOrder();
        FindAppTreeResult result = context.getResult();

        AppInfo rootApp = null;
        if (order.getRootAppId() != null) {
            rootApp = Apps.findApp(order.getRootAppId());
            if (rootApp == null) {
                throw new BizException(Status.FAIL, CommonResultCode.INVALID_PARAMETER.getCode(), String.format("应用[%s]不存在", order.getRootAppId()));
            }
        }
        result.setAppTree(getAppTree(rootApp));
    }

    // 获取应用树
    private AppTree getAppTree(AppInfo app) {
        AppTree appTree = new AppTree(app);

        List<App> childrenApp = appDao.findByParent(app == null ? null : app.getAppId());
        for (App childApp : childrenApp) {
            AppTree childTree = getAppTree(CONVERTER.convert(childApp));
            appTree.addChild(childTree);
        }

        return appTree;
    }
}
