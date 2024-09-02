package org.antframework.configcenter.dal.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.antframework.configcenter.dal.entity.PropertyValueDo;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PropertyValueMapper extends BaseMapper<PropertyValueDo> {
}