package org.antframework.configcenter.facade.vo;

import lombok.Data;

import java.util.Date;


@Data
public class SysLogVo {
    private Long id;
    private Date createTime;

    private Date updateTime;

    private String appId;

    private String branchId;

    private String newValue;

    private String oldValue;

    private String profileId;

    private Long propertyKey;

    private String updatedBy;

     

}