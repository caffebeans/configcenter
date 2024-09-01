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
import java.util.stream.Collectors;


@Service
public class SysLogServiceProvider implements SysLogService {

    @Autowired
    SysLogMapper sysLogMapper;

    @Override
    public PageInfo<SysLogVo> findAll(SysLogVo sysLogVo) {
        // 处理分页参数，默认值为第一页，10条记录
        int pageNo = (sysLogVo.getPageNo() != null) ? sysLogVo.getPageNo() : 1;
        int pageSize = (sysLogVo.getPageSize() != null) ? sysLogVo.getPageSize() : 10;

        // 使用 PageHelper 开始分页
        PageHelper.startPage(pageNo, pageSize);

        // 实例化 DO 并复制属性
        SysLogDo sysLogDo = new SysLogDo();
        BeanUtils.copyProperties(sysLogVo, sysLogDo);

        // 构建查询条件
        QueryWrapper<SysLogDo> queryWrapper = new QueryWrapper<>();
        if (sysLogVo.getPropertyKey() != null) {
            // 仅进行模糊查询
            queryWrapper.like("propertyKey", sysLogVo.getPropertyKey());
        }

        // 根据 updateTime 字段进行逆序排序
        queryWrapper.orderByDesc("updateTime");

        // 查询数据库
        List<SysLogDo> sysLogDos = sysLogMapper.selectList(queryWrapper);

        // 转换为 VO 并处理分页结果
        List<SysLogVo> sysLogVoList = sysLogDos.stream()
                .map(sysLogDoItem -> {
                    SysLogVo vo = new SysLogVo();
                    BeanUtils.copyProperties(sysLogDoItem, vo);
                    return vo;
                })
                .collect(Collectors.toList());

        // 包装分页信息
        PageInfo<SysLogVo> pageInfo = new PageInfo<>(sysLogVoList);
        pageInfo.setPageSize(pageSize);
        pageInfo.setPageNum(pageNo);

        // 返回分页信息
        return pageInfo;
    }


}
