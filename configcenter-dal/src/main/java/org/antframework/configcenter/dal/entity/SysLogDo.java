package org.antframework.configcenter.dal.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import javax.persistence.Table;
import java.util.Date;



@TableName("sys_log")
@Data
public class SysLogDo {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("createTime")
    private Date createTime;

    @TableField("updateTime")
    private Date updateTime;

    @TableField("appId")
    private String appId;


    @TableField("profileId")
    private String profileId="master";

    @TableField("branchId")
    private String branchId;

    @TableField("newValue")
    private String newValue;

    @TableField("oldValue")
    private String oldValue;

    @TableField("propertyKey")
    private String propertyKey;

    @TableField("updatedBy")
    private String updatedBy;


}