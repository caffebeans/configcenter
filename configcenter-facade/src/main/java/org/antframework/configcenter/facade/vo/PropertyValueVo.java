package org.antframework.configcenter.facade.vo;


import lombok.Data;

import java.util.Date;


@Data
public class PropertyValueVo {

    private Long id;


    private Date createTime;


    private Date updateTime;


    private String appId;


    private String branchId;


    private String key;


    private String profileId;


    private String scope;

    private String value;


}