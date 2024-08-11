/*
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2019-08-29 23:06 创建
 */
package org.antframework.configcenter.facade.order;

import lombok.Getter;
import lombok.Setter;
import org.antframework.common.util.facade.AbstractOrder;
import org.antframework.configcenter.facade.info.PropertyChange;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 发布分支
 */
@Getter
@Setter
public class ReleaseBranchOrder extends AbstractOrder {
    // 应用id
    @NotBlank
    private String appId;
    // 环境id
    @NotBlank
    private String profileId;
    // 分支id
    @NotBlank
    private String branchId;
    // 配置变动
    @NotNull
    private PropertyChange propertyChange;
    // 备注
    private String memo;
}
