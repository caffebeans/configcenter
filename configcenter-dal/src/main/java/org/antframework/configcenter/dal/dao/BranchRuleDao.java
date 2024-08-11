/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2019-09-01 14:25 创建
 */
package org.antframework.configcenter.dal.dao;

import org.antframework.configcenter.common.constant.CacheConstant;
import org.antframework.configcenter.dal.entity.BranchRule;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.RepositoryDefinition;

import javax.persistence.LockModeType;
import java.util.List;

/**
 * 分支规则dao
 */
@RepositoryDefinition(domainClass = BranchRule.class, idClass = Long.class)
public interface BranchRuleDao {
    @CacheEvict(cacheNames = CacheConstant.BRANCH_RULES_CACHE_NAME, key = "#p0.appId + ',' + #p0.profileId")
    void save(BranchRule branchRule);

    @CacheEvict(cacheNames = CacheConstant.BRANCH_RULES_CACHE_NAME, key = "#p0.appId + ',' + #p0.profileId")
    void delete(BranchRule branchRule);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    BranchRule findLockByAppIdAndProfileIdAndBranchId(String appId, String profileId, String branchId);

    @Cacheable(cacheNames = CacheConstant.BRANCH_RULES_CACHE_NAME, key = "#p0 + ',' + #p1")
    List<BranchRule> findByAppIdAndProfileIdOrderByPriorityAsc(String appId, String profileId);
}
