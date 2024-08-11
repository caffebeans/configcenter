/*
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2019-08-17 22:07 创建
 */
package org.antframework.configcenter.biz.provider;

import lombok.AllArgsConstructor;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.configcenter.facade.api.BranchService;
import org.antframework.configcenter.facade.order.*;
import org.antframework.configcenter.facade.result.ComputeBranchMergenceResult;
import org.antframework.configcenter.facade.result.FindBranchResult;
import org.antframework.configcenter.facade.result.FindBranchesResult;
import org.antframework.configcenter.facade.result.MergeBranchResult;
import org.bekit.service.ServiceEngine;
import org.springframework.stereotype.Service;

/**
 * 分支服务提供者
 */
@Service
@AllArgsConstructor
public class BranchServiceProvider implements BranchService {
    // 服务引擎
    private final ServiceEngine serviceEngine;

    @Override
    public EmptyResult addBranch(AddBranchOrder order) {
        return serviceEngine.execute("addBranchService", order);
    }

    @Override
    public ReleaseBranchResult releaseBranch(ReleaseBranchOrder order) {
        return serviceEngine.execute("releaseBranchService", order);
    }

    @Override
    public EmptyResult revertBranch(RevertBranchOrder order) {
        return serviceEngine.execute("revertBranchService", order);
    }

    @Override
    public MergeBranchResult mergeBranch(MergeBranchOrder order) {
        return serviceEngine.execute("mergeBranchService", order);
    }

    @Override
    public ComputeBranchMergenceResult computeBranchMergence(ComputeBranchMergenceOrder order) {
        return serviceEngine.execute("computeBranchMergenceService", order);
    }

    @Override
    public EmptyResult deleteBranch(DeleteBranchOrder order) {
        return serviceEngine.execute("deleteBranchService", order);
    }

    @Override
    public FindBranchResult findBranch(FindBranchOrder order) {
        return serviceEngine.execute("findBranchService", order);
    }

    @Override
    public FindBranchesResult findBranches(FindBranchesOrder order) {
        return serviceEngine.execute("findBranchesService", order);
    }
}
