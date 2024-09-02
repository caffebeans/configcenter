package org.antframework.configcenter.dal.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@TableName(value = "PropertyValue")
@Data
public class PropertyValueDo {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField(value = "createTime")
    private Date createTime;

    @TableField(value = "updateTime")
    private Date updateTime;

    @TableField(value = "appId")
    private String appId;

    @TableField(value = "branchId")
    private String branchId;

    @TableField(value = "`key`")
    private String key;

    @TableField(value = "profileId")
    private String profileId;

    @TableField(value = "`scope`")
    private String scope;

    @TableField(value = "`value`")
    private String value;


}