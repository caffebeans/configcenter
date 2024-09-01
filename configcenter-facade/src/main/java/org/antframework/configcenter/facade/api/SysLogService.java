package org.antframework.configcenter.facade.api;

import com.github.pagehelper.PageInfo;
import org.antframework.configcenter.facade.vo.SysLogVo;

import java.util.List;

public interface SysLogService{
       PageInfo<SysLogVo> findAll(SysLogVo sysLogVo);
}
