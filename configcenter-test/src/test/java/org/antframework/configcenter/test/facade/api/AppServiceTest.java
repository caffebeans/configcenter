/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-03 15:07 创建
 */
package org.antframework.configcenter.test.facade.api;

import org.antframework.common.util.facade.EmptyResult;
import org.antframework.common.util.facade.Status;
import org.antframework.configcenter.facade.api.AppService;
import org.antframework.configcenter.facade.order.*;
import org.antframework.configcenter.facade.result.*;
import org.antframework.configcenter.test.AbstractTest;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * 应用服务单元测试
 */
@Ignore
public class AppServiceTest extends AbstractTest {
    @Autowired
    private AppService appService;

    @Test
    public void testAddOrModifyApp() {
        AddOrModifyAppOrder order = new AddOrModifyAppOrder();
        order.setAppId("common");
        order.setAppName("公共配置");
        order.setParent(null);
        EmptyResult result = appService.addOrModifyApp(order);
        checkResult(result, Status.SUCCESS);

        order = new AddOrModifyAppOrder();
        order.setAppId("core-domain");
        order.setAppName("核心领域");
        order.setParent("common");
        result = appService.addOrModifyApp(order);
        checkResult(result, Status.SUCCESS);

        order = new AddOrModifyAppOrder();
        order.setAppId("account");
        order.setAppName("账务系统");
        order.setParent("core-domain");
        result = appService.addOrModifyApp(order);
        checkResult(result, Status.SUCCESS);

        order = new AddOrModifyAppOrder();
        order.setAppId("customer");
        order.setAppName("会员系统");
        order.setParent("core-domain");
        result = appService.addOrModifyApp(order);
        checkResult(result, Status.SUCCESS);
    }

    @Test
    public void testDeleteApp() {
        DeleteAppOrder order = new DeleteAppOrder();
        order.setAppId("core-domain");
        EmptyResult result = appService.deleteApp(order);
        checkResult(result, Status.FAIL);

        order = new DeleteAppOrder();
        order.setAppId("customer");
        result = appService.deleteApp(order);
        checkResult(result, Status.SUCCESS);
    }

    @Test
    public void testProduceReleaseVersion() {
        ProduceReleaseVersionOrder order = new ProduceReleaseVersionOrder();
        order.setAppId("customer");

        ProduceReleaseVersionResult result = appService.produceReleaseVersion(order);
        checkResult(result, Status.SUCCESS);
    }

    @Test
    public void testFindApp() {
        FindAppOrder order = new FindAppOrder();
        order.setAppId("customer");

        FindAppResult result = appService.findApp(order);
        checkResult(result, Status.SUCCESS);
    }

    @Test
    public void testFindInheritedApps() {
        FindInheritedAppsOrder order = new FindInheritedAppsOrder();
        order.setAppId("customer");

        FindInheritedAppsResult result = appService.findInheritedApps(order);
        checkResult(result, Status.SUCCESS);
    }

    @Test
    public void testFindAppTree() {
        FindAppTreeOrder order = new FindAppTreeOrder();
        order.setRootAppId(null);

        FindAppTreeResult result = appService.findAppTree(order);
        checkResult(result, Status.SUCCESS);
    }

    @Test
    public void testQueryApps() {
        QueryAppsOrder order = new QueryAppsOrder();
        order.setPageNo(1);
        order.setPageSize(10);
        QueryAppsResult result = appService.queryApps(order);
        checkResult(result, Status.SUCCESS);
    }
}
