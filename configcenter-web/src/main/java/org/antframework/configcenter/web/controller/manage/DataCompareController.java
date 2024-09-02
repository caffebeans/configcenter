/*
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-15 10:48 创建
 */
package org.antframework.configcenter.web.controller.manage;

import cn.hutool.http.server.HttpServerRequest;
import com.github.pagehelper.PageInfo;
import lombok.AllArgsConstructor;
import org.antframework.configcenter.facade.api.AppService;
import org.antframework.configcenter.facade.api.PropertyValueService;
import org.antframework.configcenter.facade.api.PropertyValueVoService;
import org.antframework.configcenter.facade.api.SysLogService;
import org.antframework.configcenter.facade.order.FindPropertyValuesOrder;
import org.antframework.configcenter.facade.result.FindPropertyValuesResult;
import org.antframework.configcenter.facade.vo.PropertyValueComparisonResultVo;
import org.antframework.configcenter.facade.vo.PropertyValueVo;
import org.antframework.configcenter.facade.vo.Scope;
import org.antframework.configcenter.facade.vo.SysLogVo;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 应用管理controller
 */
@RestController
@RequestMapping("/manage/dataCompare")
@AllArgsConstructor
public class DataCompareController {
    // 应用服务
    private final AppService appService;


    @Autowired
    private SysLogService service;



    @Autowired
    PropertyValueVoService propertyValueVoService;

    /**
     * 添加或修改应用
     *
     * @param appId   应用id
     * @param appName 应用名
     * @param parent  父应用id
     */

    @GetMapping("/findValues")
    public ResponseEntity<?> findValues(
            @RequestParam String appId,
            @RequestParam String branchId,
            @RequestParam String env
    ){
        PropertyValueVo order = new PropertyValueVo();
        order.setProfileId("master");
        order.setAppId(appId);
        order.setBranchId(branchId);

        List<PropertyValueVo> all = propertyValueVoService.findAll(order);
        List<PropertyValueVo> nullList = new ArrayList<>();
        List<PropertyValueComparisonResultVo> propertyValueComparisonResultVos1 = null;

        if (env.equals("source")){
            List<PropertyValueComparisonResultVo> propertyValueComparisonResultVos = comparePropertyValues(all, nullList);
             propertyValueComparisonResultVos1 = filterDifferentValues(propertyValueComparisonResultVos);

        }
        if (env.equals("dist")){
            List<PropertyValueComparisonResultVo> propertyValueComparisonResultVos = comparePropertyValues(nullList, all);
            propertyValueComparisonResultVos1 = filterDifferentValues(propertyValueComparisonResultVos);
        }

        PageInfo pageInfo = new PageInfo(propertyValueComparisonResultVos1);
        pageInfo.setPageSize(100);
        pageInfo.setTotal(propertyValueComparisonResultVos1.size());
        pageInfo.setPages(propertyValueComparisonResultVos1.size() / pageInfo.getPageSize());
        return ResponseEntity.ok(pageInfo);

    }


    @GetMapping("/compare")
    public ResponseEntity<?> compareData(
            @RequestParam String sourceAppId,
            @RequestParam String sourceBranchId,
            @RequestParam String distAppId,
            @RequestParam String distBranchId
           ) {

        PropertyValueVo sourceVo = new PropertyValueVo();
        PropertyValueVo distVo = new PropertyValueVo();
        sourceVo.setProfileId("master");
        sourceVo.setAppId(sourceAppId);
        sourceVo.setBranchId(sourceBranchId);
        distVo.setProfileId("master");
        distVo.setAppId(distAppId);
        distVo.setBranchId(distBranchId);
        List<PropertyValueVo> sourceList = propertyValueVoService.findAll(sourceVo);
        List<PropertyValueVo> distList = propertyValueVoService.findAll(distVo);
        List<PropertyValueComparisonResultVo> compareVo = comparePropertyValues(sourceList, distList);

        List<PropertyValueComparisonResultVo> propertyValueComparisonResultVos = filterDifferentValues(compareVo);
        PageInfo pageInfo = new PageInfo(propertyValueComparisonResultVos);
        pageInfo.setPageSize(100);
        pageInfo.setTotal(propertyValueComparisonResultVos.size());
        pageInfo.setPages(propertyValueComparisonResultVos.size() / pageInfo.getPageSize());
        return ResponseEntity.ok(pageInfo);


        // 处理比对逻辑
        // 调用服务层进行比对操作

        // 示例返回数据
//        List<ComparisonResult> results = dataCompareService.compare(sourceAppId, sourceBranchId, distAppId, distBranchId);

    }


    public List<PropertyValueComparisonResultVo> comparePropertyValues(List<PropertyValueVo> sourceList, List<PropertyValueVo> distList) {
        Map<String, String> sourceMap = sourceList.stream()
                .collect(Collectors.toMap(PropertyValueVo::getKey, PropertyValueVo::getValue));

        Map<String, String> distMap = distList.stream()
                .collect(Collectors.toMap(PropertyValueVo::getKey, PropertyValueVo::getValue));

        Set<String> allKeys = new HashSet<>(sourceMap.keySet());
        allKeys.addAll(distMap.keySet());

        List<PropertyValueComparisonResultVo> comparisonResults = new ArrayList<>();

        for (String key : allKeys) {
            String sourceValue = sourceMap.get(key);
            String distValue = distMap.get(key);

            PropertyValueComparisonResultVo resultVo = new PropertyValueComparisonResultVo();
            resultVo.setKey(key);
            resultVo.setSourceValue(sourceValue);
            resultVo.setDistValue(distValue);
            resultVo.setDifferent(!Objects.equals(sourceValue, distValue));

            comparisonResults.add(resultVo);
        }

        return comparisonResults;
    }
    public List<PropertyValueComparisonResultVo> filterDifferentValues(List<PropertyValueComparisonResultVo> comparisonResults) {
        return comparisonResults.stream()
                .filter(result -> {
                    // 如果 sourceValue 和 distValue 不相同，保留此项
                    return (result.getSourceValue() != null && result.getDistValue() != null && !result.getSourceValue().equals(result.getDistValue())) ||
                            (result.getSourceValue() != null && result.getDistValue() == null) ||
                            (result.getSourceValue() == null && result.getDistValue() != null);
                })
                .collect(Collectors.toList());
    }

}
