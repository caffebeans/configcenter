/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2018-10-14 21:16 创建
 */
package org.antframework.configcenter.facade.result;

import lombok.Getter;
import lombok.Setter;
import org.antframework.common.util.facade.AbstractResult;
import org.antframework.configcenter.facade.info.ProfileTree;

/**
 * 查找环境树result
 */
@Getter
@Setter
public class FindProfileTreeResult extends AbstractResult {
    // 环境树
    private ProfileTree profileTree;
}
