/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2019-09-01 14:28 创建
 */
package org.antframework.configcenter.facade.api;

import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.order.AddOrModifyBranchRuleOrder;
import org.antframework.configcenter.facade.order.ComputeBranchRulesOrder;
import org.antframework.configcenter.facade.order.DeleteBranchRuleOrder;
import org.antframework.configcenter.facade.order.FindBranchRulesOrder;
import org.antframework.configcenter.facade.result.ComputeBranchRulesResult;
import org.antframework.configcenter.facade.result.FindBranchRulesResult;

/**
 * 分支规则服务
 */
public interface BranchRuleService {
    /**
     * 新增或修改分支规则
     */
    EmptyResult addOrModifyBranchRule(AddOrModifyBranchRuleOrder order);

    /**
     * 删除分支规则
     */
    EmptyResult deleteBranchRule(DeleteBranchRuleOrder order);

    /**
     * 查找分支规则
     */
    FindBranchRulesResult findBranchRules(FindBranchRulesOrder order);

    /**
     * 计算分支规则
     */
    ComputeBranchRulesResult computeBranchRules(ComputeBranchRulesOrder order);
}
