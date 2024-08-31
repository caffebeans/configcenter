/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 01:41 创建
 */
package org.antframework.configcenter.dal.dao;

import org.antframework.configcenter.common.constant.CacheConstant;
import org.antframework.configcenter.dal.entity.PropertyValue;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.RepositoryDefinition;
import org.springframework.data.repository.query.Param;

import javax.persistence.LockModeType;
import java.util.List;

/**
 * 配置value dao
 */
@RepositoryDefinition(domainClass = PropertyValue.class, idClass = Long.class)
public interface PropertyValueDao{
    @CacheEvict(cacheNames = CacheConstant.PROPERTY_VALUES_CACHE_NAME, key = "#p0.appId + ',' + #p0.profileId + ',' + #p0.branchId")
    void save(PropertyValue propertyValue);

    @CacheEvict(cacheNames = CacheConstant.PROPERTY_VALUES_CACHE_NAME, key = "#p0.appId + ',' + #p0.profileId + ',' + #p0.branchId")
    void delete(PropertyValue propertyValue);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    PropertyValue findLockByAppIdAndProfileIdAndBranchIdAndKey(String appId, String profileId, String branchId, String key);


//    @Query("SELECT pv FROM PropertyValue pv WHERE "
//            + "pv.appId = :appId AND "
//            + "pv.profileId = :profileId AND "
//            + "pv.branchId = :branchId AND "
//            + "(COALESCE(:searchKey, '') = '' OR pv.key LIKE CONCAT('%', :searchKey, '%'))")
//    List<PropertyValue> findByAppIdAndProfileIdAndBranchIdAndKey(
//            @Param("appId") String appId,
//            @Param("profileId") String profileId,
//            @Param("branchId") String branchId,
//            @Param("searchKey") String searchKey);
//

    @Query("SELECT pv FROM PropertyValue pv WHERE "
            + "pv.appId = :appId AND "
            + "pv.profileId = :profileId AND "
            + "pv.branchId = :branchId AND "
            + "(COALESCE(:searchKey, '') = '' OR LOWER(pv.key) LIKE CONCAT('%', LOWER(:searchKey), '%'))")
    List<PropertyValue> findByAppIdAndProfileIdAndBranchIdAndKey(
            @Param("appId") String appId,
            @Param("profileId") String profileId,
            @Param("branchId") String branchId,
            @Param("searchKey") String searchKey);

    @Query("SELECT p FROM PropertyValue p WHERE p.appId = :appId AND p.profileId = :profileId AND p.branchId = :branchId")
    List<PropertyValue> findAllProfilesByParentId(
            @Param("appId") String appId,
            @Param("profileId") String profileId,
            @Param("branchId") String branchId);

    List<PropertyValue> findByKey(String key);




}
