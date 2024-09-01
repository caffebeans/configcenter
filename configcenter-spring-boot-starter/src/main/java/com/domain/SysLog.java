package com.domain;

import java.util.Date;

public class SysLog {
    private Long id;

    private Long propertyvalueid;

    private String appid;

    private String profileid;

    private String branchid;

    private String oldkey;

    private String newkey;

    private Date updatetime;

    private String updatedby;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPropertyvalueid() {
        return propertyvalueid;
    }

    public void setPropertyvalueid(Long propertyvalueid) {
        this.propertyvalueid = propertyvalueid;
    }

    public String getAppid() {
        return appid;
    }

    public void setAppid(String appid) {
        this.appid = appid;
    }

    public String getProfileid() {
        return profileid;
    }

    public void setProfileid(String profileid) {
        this.profileid = profileid;
    }

    public String getBranchid() {
        return branchid;
    }

    public void setBranchid(String branchid) {
        this.branchid = branchid;
    }

    public String getOldkey() {
        return oldkey;
    }

    public void setOldkey(String oldkey) {
        this.oldkey = oldkey;
    }

    public String getNewkey() {
        return newkey;
    }

    public void setNewkey(String newkey) {
        this.newkey = newkey;
    }

    public Date getUpdatetime() {
        return updatetime;
    }

    public void setUpdatetime(Date updatetime) {
        this.updatetime = updatetime;
    }

    public String getUpdatedby() {
        return updatedby;
    }

    public void setUpdatedby(String updatedby) {
        this.updatedby = updatedby;
    }
}