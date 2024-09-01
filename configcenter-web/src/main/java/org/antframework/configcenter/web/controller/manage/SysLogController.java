/*
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-15 10:48 创建
 */
package org.antframework.configcenter.web.controller.manage;

import com.github.pagehelper.PageInfo;
import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.AbstractQueryResult;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.biz.util.Apps;
import org.antframework.configcenter.facade.api.AppService;
import org.antframework.configcenter.facade.api.SysLogService;
import org.antframework.configcenter.facade.info.AppInfo;
import org.antframework.configcenter.facade.order.*;
import org.antframework.configcenter.facade.result.FindAppResult;
import org.antframework.configcenter.facade.result.FindAppTreeResult;
import org.antframework.configcenter.facade.result.FindInheritedAppsResult;
import org.antframework.configcenter.facade.result.QueryAppsResult;
import org.antframework.configcenter.facade.vo.SysLogVo;
import org.antframework.configcenter.web.common.AppPropertyTypes;
import org.antframework.configcenter.web.common.ManagerApps;
import org.antframework.manager.facade.enums.ManagerType;
import org.antframework.manager.facade.info.ManagerInfo;
import org.antframework.manager.web.CurrentManagerAssert;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 应用管理controller
 */
@RestController
@RequestMapping("/manage/sygLogs")
@AllArgsConstructor
public class SysLogController {
    // 应用服务
    private final AppService appService;


    @Autowired
    private SysLogService service;

    /**
     * 添加或修改应用
     *
     * @param appId   应用id
     * @param appName 应用名
     * @param parent  父应用id
     */
    @RequestMapping("/findAll")
    public ResponseEntity findAll(@ModelAttribute SysLogVo sysLogVo,
                                  @RequestParam int pageNo,
                                  @RequestParam int pageSize) {

        sysLogVo.setPageNo(pageNo);
        sysLogVo.setPageSize(pageSize);

        PageInfo<SysLogVo> all = service.findAll(sysLogVo);
        return ResponseEntity.ok(all);
    }

}
