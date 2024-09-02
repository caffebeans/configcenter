package org.antframework.configcenter.facade.api;

import org.antframework.configcenter.facade.vo.PropertyValueVo;

import java.util.List;

public interface PropertyValueVoService {
    List<PropertyValueVo> findAll(PropertyValueVo vo);
}
