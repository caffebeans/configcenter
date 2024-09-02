package org.antframework.configcenter.biz.provider;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.antframework.configcenter.dal.dao.PropertyValueMapper;
import org.antframework.configcenter.dal.entity.PropertyValueDo;
import org.antframework.configcenter.facade.api.PropertyValueVoService;
import org.antframework.configcenter.facade.vo.PropertyValueVo;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyValueVoServiceImpl implements PropertyValueVoService {

    @Resource
    private PropertyValueMapper propertyValueMapper;

    @Override
    public List<PropertyValueVo> findAll(PropertyValueVo vo) {
        PropertyValueDo propertyValueDo = new PropertyValueDo();
        BeanUtils.copyProperties(vo, propertyValueDo);
        List<PropertyValueDo> propertyValueDos = propertyValueMapper.selectList(new QueryWrapper<>(propertyValueDo));
        List<PropertyValueVo> collect = propertyValueDos.stream().map(x -> {
            PropertyValueVo v = new PropertyValueVo();
            BeanUtils.copyProperties(x, v);
            return v;

        }).collect(Collectors.toList());
        return collect;
    }
}
