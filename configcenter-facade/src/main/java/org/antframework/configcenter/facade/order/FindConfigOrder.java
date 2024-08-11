/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2017-08-20 14:03 创建
 */
package org.antframework.configcenter.facade.order;

import lombok.Getter;
import lombok.Setter;
import org.antframework.common.util.facade.AbstractOrder;

import javax.validation.constraints.NotBlank;

/**
 * 查找应用在指定环境中的配置order
 */
@Getter
@Setter
public class FindConfigOrder extends AbstractOrder {
    // 主体应用id
    @NotBlank
    private String mainAppId;
    // 被查询配置的应用id
    @NotBlank
    private String queriedAppId;
    // 环境id
    @NotBlank
    private String profileId;
    // 目标
    private String target;
}
