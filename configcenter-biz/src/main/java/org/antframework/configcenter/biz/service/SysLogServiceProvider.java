package org.antframework.configcenter.biz.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.antframework.configcenter.dal.dao.SysLogMapper;
import org.antframework.configcenter.dal.entity.SysLogDo;
import org.antframework.configcenter.facade.api.SysLogService;
import org.antframework.configcenter.facade.vo.SysLogVo;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;



@Service
public class SysLogServiceProvider implements SysLogService {

    @Autowired
    SysLogMapper sysLogMapper;

    @Override
    public List<SysLogVo> findAll(SysLogVo sysLogVo) {

        SysLogDo sysLogDo = new SysLogDo();
        BeanUtils.copyProperties(sysLogVo,sysLogDo);
        List<SysLogDo> sysLogDos = sysLogMapper.selectList(new QueryWrapper<>(sysLogDo));
        return sysLogDos.stream().map(sysLogDo1 -> {
            SysLogVo sysLogVo1 = new SysLogVo();
            BeanUtils.copyProperties(sysLogDo1,sysLogVo1);
            return sysLogVo1;
        }).toList();

    }
}
