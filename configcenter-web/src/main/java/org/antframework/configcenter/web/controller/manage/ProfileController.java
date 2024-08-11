/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-15 11:00 创建
 */
package org.antframework.configcenter.web.controller.manage;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.api.ProfileService;
import org.antframework.configcenter.facade.order.*;
import org.antframework.configcenter.facade.result.FindInheritedProfilesResult;
import org.antframework.configcenter.facade.result.FindProfileResult;
import org.antframework.configcenter.facade.result.FindProfileTreeResult;
import org.antframework.configcenter.facade.result.QueryProfilesResult;
import org.antframework.manager.web.CurrentManagerAssert;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 环境管理controller
 */
@RestController
@RequestMapping("/manage/profile")
@AllArgsConstructor
public class ProfileController {
    // 环境服务
    private final ProfileService profileService;

    /**
     * 新增或修改环境
     *
     * @param profileId   环境id
     * @param profileName 环境名
     * @param parent      父环境id
     */
    @RequestMapping("/addOrModifyProfile")
    public EmptyResult addOrModifyProfile(String profileId, String profileName, String parent) {
        CurrentManagerAssert.admin();
        AddOrModifyProfileOrder order = new AddOrModifyProfileOrder();
        order.setProfileId(profileId);
        order.setProfileName(profileName);
        order.setParent(parent);

        return profileService.addOrModifyProfile(order);
    }

    /**
     * 删除环境
     *
     * @param profileId 环境id
     */
    @RequestMapping("/deleteProfile")
    public EmptyResult deleteProfile(String profileId) {
        CurrentManagerAssert.admin();
        DeleteProfileOrder order = new DeleteProfileOrder();
        order.setProfileId(profileId);

        return profileService.deleteProfile(order);
    }

    /**
     * 查找环境
     *
     * @param profileId 环境id
     */
    @RequestMapping("/findProfile")
    public FindProfileResult findProfile(String profileId) {
        CurrentManagerAssert.current();
        FindProfileOrder order = new FindProfileOrder();
        order.setProfileId(profileId);

        return profileService.findProfile(order);
    }

    /**
     * 查找环境继承的所有环境
     *
     * @param profileId 环境id
     */
    @RequestMapping("/findInheritedProfiles")
    public FindInheritedProfilesResult findInheritedProfiles(String profileId) {
        CurrentManagerAssert.current();
        FindInheritedProfilesOrder order = new FindInheritedProfilesOrder();
        order.setProfileId(profileId);

        return profileService.findInheritedProfiles(order);
    }

    /**
     * 查找环境树
     *
     * @param rootProfileId 根节点环境id（不填表示查找所有环境）
     */
    @RequestMapping("/findProfileTree")
    public FindProfileTreeResult findProfileTree(String rootProfileId) {
        CurrentManagerAssert.current();
        FindProfileTreeOrder order = new FindProfileTreeOrder();
        order.setRootProfileId(rootProfileId);

        return profileService.findProfileTree(order);
    }

    /**
     * 分页查询环境
     *
     * @param pageNo    页码
     * @param pageSize  每页大小
     * @param profileId 环境id
     */
    @RequestMapping("/queryProfiles")
    public QueryProfilesResult queryProfiles(int pageNo, int pageSize, String profileId) {
        CurrentManagerAssert.current();
        QueryProfilesOrder order = new QueryProfilesOrder();
        order.setPageNo(pageNo);
        order.setPageSize(pageSize);
        order.setProfileId(profileId);

        return profileService.queryProfiles(order);
    }
}
