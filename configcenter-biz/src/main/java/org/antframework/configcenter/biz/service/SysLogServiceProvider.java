package org.antframework.configcenter.biz.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
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
    public PageInfo<SysLogVo> findAll(SysLogVo sysLogVo) {
        // 使用 PageHelper 开始分页
        SysLogDo sysLogDo = new SysLogDo();
        BeanUtils.copyProperties(sysLogVo,sysLogDo);
        // 使用 PageHelper 开始分页
        PageHelper.startPage(sysLogVo.getPageNo(), sysLogVo.getPageSize());
        List<SysLogDo> sysLogDos = sysLogMapper.selectList(new QueryWrapper<>(sysLogDo));
        List<SysLogVo> list = sysLogDos.stream().map(sysLogDo1 -> {
            SysLogVo sysLogVo1 = new SysLogVo();
            BeanUtils.copyProperties(sysLogDo1, sysLogVo1);
            return sysLogVo1;
        }).toList();
        PageInfo<SysLogVo> sysLogVoPageInfo = new PageInfo<>(list);
        sysLogVoPageInfo.setPageSize(sysLogVo.getPageSize());
        sysLogVoPageInfo.setPageNum(sysLogVo.getPageNo());
        // 返回分页信息
        return sysLogVoPageInfo;
    }
}
