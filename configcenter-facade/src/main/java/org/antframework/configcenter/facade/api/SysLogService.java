package org.antframework.configcenter.facade.api;

import org.antframework.configcenter.facade.vo.SysLogVo;

import java.util.List;

public interface SysLogService{
       List<SysLogVo> findAll(SysLogVo sysLogVo);
}
