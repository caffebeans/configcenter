package org.antframework.configcenter.facade.vo;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;


public class PropertyValueComparisonResultVo {

    private String key; // 被比较的键
    private String sourceValue; // 第一个列表中的值（如果存在）
    private String distValue; // 第二个列表中的值（如果存在）

    private boolean isDifferent; // 表示两个值是否不同

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSourceValue() {
        return sourceValue;
    }

    public void setSourceValue(String sourceValue) {
        this.sourceValue = sourceValue;
    }

    public String getDistValue() {
        return distValue;
    }

    public void setDistValue(String distValue) {
        this.distValue = distValue;
    }

    public boolean isDifferent() {
        return isDifferent;
    }

    public void setDifferent(boolean different) {
        isDifferent = different;
    }

    // 其他需要的字段
}