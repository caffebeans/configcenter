/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-09-15 18:19 创建
 */
package org.antframework.configcenter.facade.order;

import lombok.Getter;
import lombok.Setter;
import org.antframework.common.util.facade.AbstractOrder;
import org.antframework.configcenter.facade.vo.Scope;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 查找配置value集order
 */
@Getter
@Setter
public class ComparePropertyValuesOrder extends AbstractOrder {
    // 应用id

    private String appId;
    // 环境id

    private String profileId;
    // 分支id

    private String branchId;
    // 最小作用域

    private Scope minScope;

    private String key;

}
