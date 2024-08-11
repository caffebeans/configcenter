// 配置value管理组件
const PropertyValuesTemplate = `
<div id="propertyValuesApp">
    <el-row style="margin-bottom: 10px">
        <el-col :span="16">
            <span style="font-size: large;color: #409EFF;">环境：</span>
            <el-select v-model="currentProfileId" @change="switchProfile" placeholder="请选择环境" size="medium">
                <el-option v-for="profile in allProfiles" :value="profile.profileId" :label="toShowingProfile(profile)" :key="profile.profileId">
                    level">-
                    <span>{{ toShowingProfile(profile) }}</span>
                </el-option>
            </el-select>
            <span style="font-size: large;color: #409EFF;">分支：</span>
            <el-select v-model="branchId" @change="findAllData" placeholder="请选择分支" size="medium">
                <el-option v-for="branch in branches" :value="branch.branchId" :label="branch.branchId" :key="branch.branchId"></el-option>
            </el-select>
        </el-col>
        <el-col :span="8" style="text-align: right;">
            <router-link :to="'/configs/' + appId + '/' + profileId + '/branches'">
                <el-button type="text">分支管理</el-button>
            </router-link>
            &nbsp;&nbsp;
            <router-link :to="'/configs/' + appId + '/' + profileId + '/releases/' + branchId">
                <el-button type="text">发布历史</el-button>
            </router-link>
        </el-col>
    </el-row>
    <el-row style="margin-bottom: 10px">
        <el-col :span="5">
            <el-button type="primary" icon="el-icon-plus" size="small" :disabled="showMode!=='table'" @click="addPropertyValueDialogShowing = true" plain>新增</el-button>
        </el-col>
        <el-col :span="14" style="text-align: center;">
            <span style="font-size: x-large;color: #409EFF;">{{ toShowingApp(appProperties[0] ? appProperties[0].app : null) }}</span>
            <el-radio-group v-model="showMode" size="mini" @change="changeShowMode">
                <el-tooltip content="以表格方式编辑" placement="top" :open-delay="1000" :hide-after="3000">
                    <el-radio-button label="table">表格</el-radio-button>
                </el-tooltip>
                <el-tooltip content="以文本方式编辑" placement="top" :open-delay="1000" :hide-after="3000">
                    <el-radio-button label="text">文本</el-radio-button>
                </el-tooltip>
                <el-tooltip content="显示应用实际获取到的所有配置" placement="top" :open-delay="1000" :hide-after="4000">
                    <el-radio-button label="all">所有</el-radio-button>
                </el-tooltip>
            </el-radio-group>
        </el-col>
        <el-col :span="5" style="text-align: end">
            <el-popover placement="top" v-model="revertPopoverShowing" trigger="manual">
                <p>所有修改都会被还原，确定还原？</p>
                <div style="text-align: right; margin: 0">
                    <el-button type="text" size="mini" @click="revertPopoverShowing = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="revertPropertyValues">确定</el-button>
                </div>
                <el-button slot="reference" icon="el-icon-close" size="small" :disabled="!edited || showMode!=='table'" @click="revertPopoverShowing = true">还原修改</el-button>
            </el-popover>
            <el-button type="primary" icon="el-icon-upload" size="small" :disabled="!edited || showMode!=='table'" @click="showReleaseBranchDialog">发布修改</el-button>
        </el-col>
    </el-row>
    <template v-if="showMode!=='all'">
        <div v-for="appProperty in appProperties" style="margin-bottom: 30px;">
            <el-row v-if="appProperty.app.appId !== appId" style="margin-bottom: 10px">
                <el-col :offset="4" :span="16" style="text-align: center;">
                    <span style="font-size: large;color: #67c23a;">{{ toShowingApp(appProperty.app) }}</span>
                </el-col>
            </el-row>
            <template v-for="profileProperty in appProperty.profileProperties">
                <template v-if="showMode==='table' || appProperty.app.appId!==appId || profileProperty.profileId!==profileId">
                    <el-table v-if="profileProperty.properties.length > 0"
                              :key="'table:' + appProperty.app.appId + ':' + profileProperty.profileId + ':properties'"
                              :show-header="profileProperty.profileId === profileId"
                              :data="profileProperty.properties"
                              :row-key="calcRowKey"
                              :default-sort="{prop: 'key'}"
                              :span-method="profilePropertySpanMethod"
                              :cell-class-name="tableCellClassName"
                              :cell-style="{padding: '3px 0px'}"
                              border>
                        <el-table-column label="环境" :resizable="false" width="150px">
                            <template slot-scope="{ row }">
                                <span style="font-size: larger;color: #409EFF">{{ profileProperty.profileId }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="key" label="配置key" :resizable="false">
                            <template slot-scope="{ row }">
                                <template v-if="appProperty.app.appId === appId && profileProperty.profileId === profileId">
                                    <el-badge v-if="differenceForMap.addedKeys[row.key]" type="success" value="新" class="badge-style">
                                        <span class="badged-text-style propertyValue-text-style">{{ row.key }}</span>
                                    </el-badge>
                                    <el-badge v-else-if="differenceForMap.deletedKeys[row.key]" type="danger" value="删" class="badge-style">
                                        <span class="badged-text-style propertyValue-text-style">{{ row.key }}</span>
                                    </el-badge>
                                    <span v-else class="propertyValue-text-style">{{ row.key }}</span>
                                </template>
                                <span v-else class="propertyValue-text-style">{{ row.key }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="value" label="配置value" :resizable="false">
                            <template slot-scope="{ row }">
                                <el-input v-if="row.editing" v-model="row.editingValue" type="textarea" autosize size="mini" clearable placeholder="请输入配置value"></el-input>
                                <template v-else>
                                    <template v-if="appProperty.app.appId === appId && profileProperty.profileId === profileId && differenceForMap.modifiedValueKeys[row.key]">
                                        <el-badge type="warning" value="改" class="badge-style">
                                            <el-tag v-if="row.value === null" size="medium">无效</el-tag>
                                            <el-tag v-else-if="manager.type === 'NORMAL' && row.propertyType === 'NONE'" type="danger" size="medium">无权限</el-tag>
                                            <span v-else class="badged-text-style propertyValue-text-style">{{ row.value }}</span>
                                        </el-badge>
                                    </template>
                                    <div v-else>
                                        <el-tag v-if="row.value === null" size="medium">无效</el-tag>
                                        <el-tag v-else-if="manager.type === 'NORMAL' && row.propertyType === 'NONE'" type="danger" size="medium">无权限</el-tag>
                                        <span v-else class="propertyValue-text-style">{{ row.value }}</span>
                                    </div>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column prop="memo" label="备注" :resizable="false">
                            <template slot-scope="{ row }">
                                <span class="propertyValue-text-style">{{ row.memo }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="scope" label="作用域" :resizable="false" width="115px">
                            <template slot-scope="{ row }">
                                <el-select v-if="row.editing" v-model="row.editingScope" size="mini" placeholder="请选择作用域" style="width: 90%">
                                    <el-option value="PRIVATE" label="私有"></el-option>
                                    <el-option value="PROTECTED" label="可继承"></el-option>
                                    <el-option value="PUBLIC" label="公开"></el-option>
                                </el-select>
                                <template v-else>
                                    <template v-if="appProperty.app.appId === appId && profileProperty.profileId === profileId && differenceForMap.modifiedScopeKeys[row.key]">
                                        <el-badge type="warning" value="改" class="badge-style">
                                            <el-tag v-if="row.scope === 'PRIVATE'" size="medium">私有</el-tag>
                                            <el-tag v-else-if="row.scope === 'PROTECTED'" type="success" size="medium">可继承</el-tag>
                                            <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning" size="medium">公开</el-tag>
                                        </el-badge>
                                    </template>
                                    <div v-else>
                                        <el-tag v-if="row.scope === 'PRIVATE'" size="medium">私有</el-tag>
                                        <el-tag v-else-if="row.scope === 'PROTECTED'" type="success" size="medium">可继承</el-tag>
                                        <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning" size="medium">公开</el-tag>
                                    </div>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" header-align="center" align="center" :resizable="false" width="140px">
                            <template slot-scope="{ row }">
                                <template v-if="appProperty.app.appId === appId && profileProperty.profileId === profileId">
                                    <template v-if="differenceForMap.deletedKeys[row.key]">
                                        <el-tooltip content="恢复" placement="top" :open-delay="1000" :hide-after="3000">
                                            <el-button @click="addOrModifyPropertyValue(row.key, row.value, row.scope)" :disabled="manager.type === 'NORMAL' && row.propertyType !== 'READ_WRITE'" type="success" icon="el-icon-plus" size="mini" circle></el-button>
                                        </el-tooltip>
                                    </template>
                                    <template v-else-if="row.value === null || row.temporary">
                                        <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                                            <el-button @click="startEditing(row)" type="primary" :disabled="manager.type === 'NORMAL' && row.propertyType !== 'READ_WRITE'" icon="el-icon-edit" size="mini" circle></el-button>
                                        </el-tooltip>
                                        <el-button-group v-else>
                                            <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                                <el-button @click="cancelEditing(row)" type="info" icon="el-icon-close" size="mini" circle></el-button>
                                            </el-tooltip>
                                            <el-tooltip content="确认修改" placement="top" :open-delay="1000" :hide-after="3000">
                                                <el-button @click="saveEditing(row)" type="success" icon="el-icon-check" size="mini" circle></el-button>
                                            </el-tooltip>
                                        </el-button-group>
                                    </template>
                                    <el-row v-else>
                                        <el-col :span="12" style="text-align: center">
                                            <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                                                <el-button @click="startEditing(row)" type="primary" :disabled="manager.type === 'NORMAL' && row.propertyType !== 'READ_WRITE'" icon="el-icon-edit" size="mini" circle></el-button>
                                            </el-tooltip>
                                            <el-button-group v-else>
                                                <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                                    <el-button @click="cancelEditing(row)" type="info" icon="el-icon-close" size="mini" circle></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="确认修改" placement="top" :open-delay="1000" :hide-after="3000">
                                                    <el-button @click="saveEditing(row)" type="success" icon="el-icon-check" size="mini" circle></el-button>
                                                </el-tooltip>
                                            </el-button-group>
                                        </el-col>
                                        <el-col :span="12" style="text-align: center">
                                            <el-tooltip content="删除" placement="top" :open-delay="1000" :hide-after="3000">
                                                <el-button @click="deletePropertyValue(row.key)" type="danger" :disabled="manager.type === 'NORMAL' && row.propertyType !== 'READ_WRITE'" icon="el-icon-delete" size="mini" circle></el-button>
                                            </el-tooltip>
                                        </el-col>
                                    </el-row>
                                </template>
                                <template v-else-if="isShowOverrideButton(row)">
                                    <el-tooltip content="覆盖" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="overrideProperty(row)" :disabled="manager.type === 'NORMAL' && row.propertyType !== 'READ_WRITE'" type="success" icon="el-icon-edit" size="mini" plain circle></el-button>
                                    </el-tooltip>
                                </template>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-table v-else
                              :key="'table:' + appProperty.app.appId + ':' + profileProperty.profileId + ':empty'"
                              :show-header="profileProperty.profileId === profileId"
                              :data="[{}]"
                              :span-method="profilePropertyEmptyOrShowTextSpanMethod"
                              :cell-style="{padding: '3px 0px'}"
                              :cell-class-name="emptyTableCellClassName"
                              border>
                        <el-table-column label="环境" :resizable="false" width="150px">
                            <span style="font-size: larger;color: #409EFF">{{ profileProperty.profileId }}</span>
                        </el-table-column>
                        <el-table-column prop="key" label="配置key" :resizable="false">
                            <div style="text-align: center">
                                <span class="configcenter-table__empty-text">暂无数据</span>
                            </div>
                        </el-table-column>
                        <el-table-column prop="value" label="配置value" :resizable="false">
                        </el-table-column>
                        <el-table-column prop="memo" label="备注" :resizable="false">
                        </el-table-column>
                        <el-table-column prop="scope" label="作用域" :resizable="false" width="115px">
                        </el-table-column>
                        <el-table-column label="操作" header-align="center" align="center" :resizable="false" width="140px">
                        </el-table-column>
                    </el-table>
                </template>
                <template v-else>
                    <el-table :key="'table:' + appProperty.app.appId + ':' + profileProperty.profileId + ':text'"
                              :data="[{}]"
                              :span-method="profilePropertyEmptyOrShowTextSpanMethod"
                              :cell-style="{padding: '3px 0px'}"
                              border>
                        <el-table-column label="环境" :resizable="false" width="150px">
                            <span style="font-size: larger;color: #409EFF">{{ profileProperty.profileId }}</span>
                        </el-table-column>
                        <el-table-column prop="key" label="配置key" :resizable="false">
                            <el-input v-model="editingPropertyValuesInText" type="textarea" autosize size="mini" clearable placeholder="请输入配置集"></el-input>
                        </el-table-column>
                        <el-table-column prop="value" label="配置value" :resizable="false">
                        </el-table-column>
                        <el-table-column prop="memo" label="备注" :resizable="false">
                        </el-table-column>
                        <el-table-column prop="scope" label="作用域" :resizable="false" width="115px">
                        </el-table-column>
                        <el-table-column label="操作" header-align="center" align="center" :resizable="false" width="140px">
                            <el-tooltip content="提交修改" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button type="primary" icon="el-icon-finished" size="mini" circle :disabled="editingPropertyValuesInText===propertyValuesInText" @click="showSubmitEditingPropertyValuesInText"></el-button>
                            </el-tooltip>
                        </el-table-column>
                    </el-table>
                </template>
            </template>
        </div>
    </template>
    <template v-else>
        <div class="el-textarea el-input--mini">
            <textarea disabled="disabled" autocomplete="off" class="el-textarea__inner" style="height: 550px;" placeholder="无配置">{{ allPropertiesInText }}</textarea>
        </div>
    </template>

    <el-dialog :visible.sync="addPropertyValueDialogShowing" :before-close="closeAddPropertyValueDialog" title="新增配置项" width="50%">
        <el-form ref="addPropertyValueForm" :model="addPropertyValueForm" label-width="20%">
            <el-form-item label="配置key" prop="key" :rules="[{required:true, message:'请输入配置key', trigger:'blur'}]">
                <el-input v-model="addPropertyValueForm.key" clearable placeholder="请输入配置key" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="配置value" prop="value" :rules="[{required:true, message:'请输入配置value', trigger:'blur'}]">
                <el-input v-model="addPropertyValueForm.value" type="textarea" autosize clearable placeholder="请输入配置value" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="作用域" prop="scope" :rules="[{required:true, message:'请选择作用域', trigger:'blur'}]">
                <el-select v-model="addPropertyValueForm.scope" placeholder="请选择作用域" style="width: 90%">
                    <el-option value="PRIVATE" label="私有"></el-option>
                    <el-option value="PROTECTED" label="可继承"></el-option>
                    <el-option value="PUBLIC" label="公开"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeAddPropertyValueDialog">取消</el-button>
            <el-button type="primary" @click="addPropertyValue">提交</el-button>
        </div>
    </el-dialog>
    <el-dialog :visible.sync="releaseBranchDialogVisible" :before-close="closeReleaseBranchDialog" title="新增发布" width="70%" center>
        <el-row>
            <el-col :span="3" style="text-align: right;">
                <span style="margin-right: 12px">变更的配置</span>
            </el-col>
            <el-col :span="21">
                <el-table :key="'table:modifiedProperties'"
                          :data="modifiedProperties"
                          :default-sort="{prop: 'key'}"
                          :cell-style="{padding: '5px 0px'}"
                          border>
                    <el-table-column prop="key" label="配置key">
                        <template slot-scope="{ row }">
                            <el-badge v-if="differenceForMap.addedKeys[row.key]" type="success" value="新" class="badge-style">
                                <span class="badged-text-style propertyValue-text-style">{{ row.key }}</span>
                            </el-badge>
                            <el-badge v-else-if="differenceForMap.deletedKeys[row.key]" type="danger" value="删" class="badge-style">
                                <span class="badged-text-style propertyValue-text-style">{{ row.key }}</span>
                            </el-badge>
                            <span v-else class="propertyValue-text-style">{{ row.key }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="配置value">
                        <template slot-scope="{ row }">
                            <template v-if="differenceForMap.modifiedValueKeys[row.key]">
                                <el-badge type="warning" value="改" class="badge-style">
                                    <el-tag v-if="row.value === null">无效</el-tag>
                                    <el-tag v-else-if="manager.type === 'NORMAL' && row.propertyType === 'NONE'" type="danger">无权限</el-tag>
                                    <span v-else class="badged-text-style propertyValue-text-style">{{ row.value }}</span>
                                </el-badge>
                            </template>
                            <div v-else>
                                <el-tag v-if="row.value === null">无效</el-tag>
                                <el-tag v-else-if="manager.type === 'NORMAL' && row.propertyType === 'NONE'" type="danger">无权限</el-tag>
                                <span v-else class="propertyValue-text-style">{{ row.value }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="scope" label="作用域" :resizable="false" width="120px">
                        <template slot-scope="{ row }">
                            <template v-if="differenceForMap.modifiedScopeKeys[row.key]">
                                <el-badge type="warning" value="改" class="badge-style">
                                    <el-tag v-if="row.scope === 'PRIVATE'" size="medium">私有</el-tag>
                                    <el-tag v-else-if="row.scope === 'PROTECTED'" type="success" size="medium">可继承</el-tag>
                                    <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning" size="medium">公开</el-tag>
                                </el-badge>
                            </template>
                            <div v-else>
                                <el-tag v-if="row.scope === 'PRIVATE'" size="medium">私有</el-tag>
                                <el-tag v-else-if="row.scope === 'PROTECTED'" type="success" size="medium">可继承</el-tag>
                                <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning" size="medium">公开</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-form ref="releaseBranchForm" :model="releaseBranchForm" label-width="12.5%">
            <el-form-item label="备注" prop="memo" :rules="[{required:false, message:'请输入备注', trigger:'blur'}]">
                <el-input v-model="releaseBranchForm.memo" type="textarea" autosize clearable placeholder="请输入备注"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeReleaseBranchDialog">取消</el-button>
            <el-button type="primary" @click="releaseBranch">提交</el-button>
        </div>
    </el-dialog>
</div>
`;

const PropertyValues = {
    template: PropertyValuesTemplate,
    props: ['appId', 'profileId'],
    data: function () {
        return {
            currentProfileId: this.profileId,
            branchId: 'master',
            manager: CURRENT_MANAGER,
            allProfiles: [],
            branches: [],
            selfPropertiesLoading: false,
            appProperties: [],
            propertyValues: [],
            difference: {
                addedKeys: [],
                modifiedValueKeys: [],
                modifiedScopeKeys: [],
                deletedKeys: []
            },
            inheritedAppReleases: [],
            inheritedAppPropertyKeys: [],
            inheritedAppRules: [],
            showMode: 'table',
            editingPropertyValuesInText: '',
            addPropertyValueDialogShowing: false,
            addPropertyValueForm: {
                key: null,
                value: null,
                scope: null
            },
            revertPopoverShowing: false,
            releaseBranchDialogVisible: false,
            releaseBranchForm: {
                memo: null
            }
        };
    },
    computed: {
        edited: function () {
            return this.difference.addedKeys.length > 0
                || this.difference.modifiedValueKeys.length > 0
                || this.difference.modifiedScopeKeys.length > 0
                || this.difference.deletedKeys.length > 0;
        },
        differenceForMap: function () {
            let forMap = {
                addedKeys: {},
                modifiedValueKeys: {},
                modifiedScopeKeys: {},
                deletedKeys: {}
            };
            this.difference.addedKeys.forEach(function (key) {
                forMap.addedKeys[key] = true;
            });
            this.difference.modifiedValueKeys.forEach(function (key) {
                forMap.modifiedValueKeys[key] = true;
            });
            this.difference.modifiedScopeKeys.forEach(function (key) {
                forMap.modifiedScopeKeys[key] = true;
            });
            this.difference.deletedKeys.forEach(function (key) {
                forMap.deletedKeys[key] = true;
            });

            return forMap;
        },
        editingKeyProperties: function () {
            const theThis = this;

            let keyProperties = {};
            this.appProperties.forEach(function (appProperty) {
                appProperty.profileProperties.forEach(function (profileProperty) {
                    if (appProperty.app.appId === theThis.appId && profileProperty.profileId === theThis.profileId) {
                        profileProperty.properties.forEach(function (property) {
                            keyProperties[property.key] = property;
                        });
                    }
                });
            });
            return keyProperties;
        },
        appKeyMemosMap: function () {
            let appMap = {};
            let allKeyMemos = {};
            for (let i = this.inheritedAppPropertyKeys.length - 1; i >= 0; i--) {
                let appPropertyKey = this.inheritedAppPropertyKeys[i];
                appPropertyKey.propertyKeys.forEach(function (propertyKey) {
                    allKeyMemos[propertyKey.key] = propertyKey.memo;
                });

                let keyMemos = {};
                for (let key in allKeyMemos) {
                    keyMemos[key] = allKeyMemos[key];
                }
                appMap[appPropertyKey.app.appId] = keyMemos;
            }

            return appMap;
        },
        keyValidityMap: function () {
            const theThis = this;

            let appMap = {};
            let keys = {};
            this.inheritedAppReleases.forEach(function (appRelease) {
                let profileMap = {};
                appRelease.inheritedProfileReleases.forEach(function (release) {
                    let keyMap = {};
                    if (release.appId === theThis.appId && release.profileId === theThis.profileId) {
                        theThis.propertyValues.forEach(function (propertyValue) {
                            if (keys[propertyValue.key]) {
                                keyMap[propertyValue.key] = false;
                            } else {
                                keyMap[propertyValue.key] = true;
                                keys[propertyValue.key] = true;
                            }
                        });
                    } else {
                        release.properties.forEach(function (property) {
                            if (keys[property.key]) {
                                keyMap[property.key] = false;
                            } else {
                                keyMap[property.key] = true;
                                keys[property.key] = true;
                            }
                        });
                    }
                    profileMap[release.profileId] = keyMap;
                });
                appMap[appRelease.app.appId] = profileMap;
            });

            return appMap;
        },
        propertyKeyValidityMap: function () {
            const theThis = this;

            let appMap = {};
            let keys = {};
            this.inheritedAppReleases.forEach(function (appRelease) {
                appRelease.inheritedProfileReleases.forEach(function (release) {
                    if (release.appId === theThis.appId && release.profileId === theThis.profileId) {
                        theThis.propertyValues.forEach(function (propertyValue) {
                            keys[propertyValue.key] = true;
                        });
                    } else {
                        release.properties.forEach(function (property) {
                            keys[property.key] = true;
                        });
                    }
                });
                let keyMap = {};
                theThis.inheritedAppPropertyKeys.forEach(function (appPropertyKey) {
                    if (appPropertyKey.app.appId === appRelease.app.appId) {
                        appPropertyKey.propertyKeys.forEach(function (propertyKey) {
                            if (keys[propertyKey.key]) {
                                keyMap[propertyKey.key] = false;
                            } else {
                                keyMap[propertyKey.key] = true;
                                keys[propertyKey.key] = true;
                            }
                        });
                    }
                });
                appMap[appRelease.app.appId] = keyMap;
            });

            return appMap;
        },
        propertyValuesInText: function () {
            let sortedPropertyValues = [];
            this.propertyValues.forEach(function (propertyValue) {
                sortedPropertyValues.push(propertyValue);
            });
            sortedPropertyValues.sort(function (left, right) {
                if (left.key < right.key) {
                    return -1
                } else if (left.key === right.key) {
                    return 0;
                } else {
                    return 1;
                }
            });

            let text = '';
            sortedPropertyValues.forEach(function (propertyValue) {
                if (text !== '') {
                    text += '\n';
                }
                text += propertyValue.key + '=' + propertyValue.value;
            });
            return text;
        },
        supposedKeyScopes: function () {
            let keyScopes = {};
            for (let i = this.inheritedAppPropertyKeys.length - 1; i >= 0; i--) {
                let appPropertyKey = this.inheritedAppPropertyKeys[i];
                appPropertyKey.propertyKeys.forEach(function (propertyKey) {
                    keyScopes[propertyKey.key] = propertyKey.scope;
                });
            }
            for (let i = this.inheritedAppReleases.length - 1; i >= 0; i--) {
                let appRelease = this.inheritedAppReleases[i];
                for (let j = appRelease.inheritedProfileReleases.length - 1; j >= 0; j--) {
                    let release = appRelease.inheritedProfileReleases[j];
                    release.properties.forEach(function (property) {
                        keyScopes[property.key] = property.scope;
                    });
                }
            }
            this.propertyValues.forEach(function (propertyValue) {
                keyScopes[propertyValue.key] = propertyValue.scope;
            });

            return keyScopes;
        },
        modifiedProperties: function () {
            const theThis = this;

            let properties = [];
            this.propertyValues.forEach(function (propertyValue) {
                if (theThis.differenceForMap.addedKeys[propertyValue.key]
                    || theThis.differenceForMap.modifiedValueKeys[propertyValue.key]
                    || theThis.differenceForMap.modifiedScopeKeys[propertyValue.key]) {
                    properties.push({
                        key: propertyValue.key,
                        value: propertyValue.value,
                        scope: propertyValue.scope,
                        propertyType: theThis.computePropertyType(theThis.appId, propertyValue.key)
                    });
                }
            });

            this.inheritedAppReleases.forEach(function (appRelease) {
                if (appRelease.app.appId !== theThis.appId) {
                    return;
                }
                appRelease.inheritedProfileReleases.forEach(function (release) {
                    if (release.profileId !== theThis.profileId) {
                        return;
                    }
                    release.properties.forEach(function (property) {
                        if (theThis.differenceForMap.deletedKeys[property.key]) {
                            properties.push({
                                key: property.key,
                                value: property.value,
                                scope: property.scope,
                                propertyType: theThis.computePropertyType(theThis.appId, property.key)
                            });
                        }
                    });
                });
            });

            return properties;
        },
        allPropertiesInText: function () {
            let keyProperties = {};
            for (let i = this.inheritedAppReleases.length - 1; i >= 0; i--) {
                let appRelease = this.inheritedAppReleases[i];
                for (let j = appRelease.inheritedProfileReleases.length - 1; j >= 0; j--) {
                    let release = appRelease.inheritedProfileReleases[j];
                    if (release.appId !== this.appId || release.profileId !== this.profileId) {
                        release.properties.forEach(function (property) {
                            keyProperties[property.key] = property;
                        });
                    }
                }
            }
            this.propertyValues.forEach(function (propertyValue) {
                keyProperties[propertyValue.key] = {
                    key: propertyValue.key,
                    value: propertyValue.value,
                    scope: propertyValue.scope
                }
            });

            let sortedProperties = [];
            for (let key in keyProperties) {
                sortedProperties.push(keyProperties[key]);
            }
            sortedProperties.sort(function (left, right) {
                if (left.key < right.key) {
                    return -1
                } else if (left.key === right.key) {
                    return 0;
                } else {
                    return 1;
                }
            });

            let text = '';
            sortedProperties.forEach(function (property) {
                if (text !== '') {
                    text += '\n';
                }
                text += property.key + '=' + property.value;
            });
            return text;
        }
    },
    watch: {
        '$route': function () {
            this.findAllData();
        },
        propertyValues: function () {
            this.refreshAppProperties();
            this.changeShowMode();
        },
        difference: function () {
            this.refreshAppProperties();
        },
        inheritedAppReleases: function () {
            this.refreshAppProperties();
        },
        inheritedAppPropertyKeys: function () {
            this.refreshAppProperties();
        },
        inheritedAppRules: function () {
            this.refreshAppProperties();
        }
    },
    created: function () {
        this.findAllData();
    },
    methods: {
        findAllData: function () {
            this.findAllProfiles();
            this.findBranches();
            this.findPropertyValues();
            this.findDifference();
            this.findInheritedAppReleases();
            this.findInheritedAppPropertyKeys();
            this.findInheritedAppRules();
        },
        refreshAppProperties: function () {
            const theThis = this;

            let appProperties = [];
            this.inheritedAppReleases.forEach(function (appRelease) {
                let appProperty = {
                    app: appRelease.app,
                    profileProperties: []
                };
                appRelease.inheritedProfileReleases.forEach(function (release) {
                    let profileProperty = {
                        profileId: release.profileId,
                        properties: []
                    };
                    let keyMemos = theThis.appKeyMemosMap[release.appId];
                    if (release.appId === theThis.appId && release.profileId === theThis.profileId) {
                        theThis.propertyValues.forEach(function (propertyValue) {
                            profileProperty.properties.push({
                                appId: release.appId,
                                profileId: release.profileId,
                                key: propertyValue.key,
                                value: propertyValue.value,
                                scope: propertyValue.scope,
                                memo: keyMemos && keyMemos[propertyValue.key] ? keyMemos[propertyValue.key] : null,
                                propertyType: theThis.computePropertyType(release.appId, propertyValue.key),
                                editing: false,
                                editingValue: null,
                                editingScope: null
                            });
                        });
                        theThis.difference.deletedKeys.forEach(function (key) {
                            let property;
                            for (let i = 0; i < release.properties.length; i++) {
                                if (release.properties[i].key === key) {
                                    property = release.properties[i];
                                    break;
                                }
                            }
                            if (property) {
                                let existing = false;
                                for (let i = 0; i < profileProperty.properties.length; i++) {
                                    let temp = profileProperty.properties[i];
                                    if (temp.key === property.key) {
                                        existing = true;
                                        break;
                                    }
                                }
                                if (!existing) {
                                    profileProperty.properties.push({
                                        appId: release.appId,
                                        profileId: release.profileId,
                                        key: property.key,
                                        value: property.value,
                                        scope: property.scope,
                                        memo: keyMemos && keyMemos[property.key] ? keyMemos[property.key] : null,
                                        propertyType: theThis.computePropertyType(release.appId, property.key),
                                        editing: false,
                                        editingValue: null,
                                        editingScope: null
                                    });
                                }
                            }
                        });
                    } else {
                        release.properties.forEach(function (property) {
                            profileProperty.properties.push({
                                appId: release.appId,
                                profileId: release.profileId,
                                key: property.key,
                                value: property.value,
                                scope: property.scope,
                                memo: keyMemos && keyMemos[property.key] ? keyMemos[property.key] : null,
                                propertyType: theThis.computePropertyType(release.appId, property.key),
                                editing: false,
                                editingValue: null,
                                editingScope: null
                            });
                        });
                    }
                    appProperty.profileProperties.push(profileProperty);
                });
                theThis.fillCurrentProfileProperties(appProperty);
                appProperty.profileProperties.forEach(function (profileProperty) {
                    profileProperty.properties.forEach(function (property) {
                        property.propertiesSize = profileProperty.properties.length;
                    });
                });

                appProperties.push(appProperty);
            });

            this.appProperties = appProperties;
        },
        fillCurrentProfileProperties: function (appProperty) {
            const theThis = this;

            let propertyKeyMap = {};
            this.inheritedAppPropertyKeys.forEach(function (appPropertyKey) {
                if (appPropertyKey.app.appId === appProperty.app.appId) {
                    appPropertyKey.propertyKeys.forEach(function (propertyKey) {
                        propertyKeyMap[propertyKey.key] = propertyKey;
                    });
                }
            });
            appProperty.profileProperties.forEach(function (profileProperty) {
                profileProperty.properties.forEach(function (property) {
                    delete propertyKeyMap[property.key];
                });
            });
            appProperty.profileProperties.forEach(function (profileProperty) {
                if (profileProperty.profileId === theThis.profileId) {
                    for (let key in propertyKeyMap) {
                        let propertyKey = propertyKeyMap[key];
                        profileProperty.properties.push({
                            appId: appProperty.app.appId,
                            profileId: profileProperty.profileId,
                            key: propertyKey.key,
                            value: null,
                            scope: propertyKey.scope,
                            memo: propertyKey.memo,
                            propertyType: theThis.computePropertyType(propertyKey.appId, propertyKey.key),
                            editing: false,
                            editingValue: null,
                            editingScope: null
                        });
                    }
                }
            });
        },
        changeShowMode: function () {
            if (this.showMode === 'text') {
                this.editingPropertyValuesInText = this.propertyValuesInText;
            }
        },
        showSubmitEditingPropertyValuesInText: function () {
            const theThis = this;
            Vue.prototype.$confirm('确定提交修改？', '警告', {type: 'warning'})
                .then(function () {
                    theThis.submitEditingPropertyValuesInText();
                });
        },
        submitEditingPropertyValuesInText: function () {
            const theThis = this;

            let propertyInTexts = this.editingPropertyValuesInText.split('\n');
            let keyValues = {};
            let invalidPropertyInTexts = [];
            let repeatedKeyMap = {};
            propertyInTexts.forEach(function (propertyInText) {
                propertyInText = propertyInText.trim();
                if (!propertyInText || propertyInText.startsWith('#')) {
                    return;
                }
                let index = propertyInText.indexOf('=');
                if (index <= 0 || index >= propertyInText.length - 1) {
                    invalidPropertyInTexts.push(propertyInText);
                } else {
                    let key = propertyInText.substring(0, index).trim();
                    let value = propertyInText.substring(index + 1).trim();
                    if (keyValues[key] !== undefined) {
                        repeatedKeyMap[key] = true;
                    }
                    keyValues[key] = value;
                }
            });
            let repeatedKeys = [];
            for (let key in repeatedKeyMap) {
                repeatedKeys.push(key);
            }
            if (invalidPropertyInTexts.length > 0) {
                Vue.prototype.$message.error("存在非法的配置：" + invalidPropertyInTexts);
                return
            }
            if (repeatedKeys.length > 0) {
                Vue.prototype.$message.error("存在重复的配置key：" + repeatedKeys);
                return
            }

            let oldKeyValues = {};
            this.propertyValues.forEach(function (propertyValue) {
                oldKeyValues[propertyValue.key] = propertyValue.value;
            });

            let addedOrModifiedPropertyValues = [];
            for (let key in keyValues) {
                let value = keyValues[key];
                let oldValue = oldKeyValues[key];
                if (value !== oldValue) {
                    let scope = this.supposedKeyScopes[key];
                    if (!scope) {
                        scope = 'PRIVATE';
                    }
                    addedOrModifiedPropertyValues.push({
                        key: key,
                        value: value,
                        scope: scope
                    });
                }
            }

            let deletedKeys = [];
            for (let key in oldKeyValues) {
                let value = keyValues[key];
                if (value === undefined) {
                    deletedKeys.push(key);
                }
            }

            if (this.manager.type === 'NORMAL') {
                let notReadWriteKeys = [];
                addedOrModifiedPropertyValues.forEach(function (propertyValue) {
                    let propertyType = theThis.computePropertyType(theThis.appId, propertyValue.key);
                    if (propertyType !== 'READ_WRITE') {
                        notReadWriteKeys.push(propertyValue.key);
                    }
                });
                deletedKeys.forEach(function (key) {
                    let propertyType = theThis.computePropertyType(theThis.appId, key);
                    if (propertyType !== 'READ_WRITE') {
                        notReadWriteKeys.push(key);
                    }
                });
                if (notReadWriteKeys.length > 0) {
                    Vue.prototype.$message.error('无权限修改敏感配置：' + notReadWriteKeys);
                    return;
                }
            }

            let addOrModifies = function (index, callback) {
                if (index < addedOrModifiedPropertyValues.length) {
                    let propertyValue = addedOrModifiedPropertyValues[index];
                    theThis.doAddOrModifyPropertyValue(propertyValue.key, propertyValue.value, propertyValue.scope, function () {
                        addOrModifies(index + 1, callback);
                    });
                } else {
                    if (callback) {
                        callback();
                    }
                }
            }
            let deletes = function (index, callback) {
                if (index < deletedKeys.length) {
                    let key = deletedKeys[index];
                    theThis.doDeletePropertyValue(key, function () {
                        deletes(index + 1, callback);
                    });
                } else {
                    if (callback) {
                        callback();
                    }
                }
            }
            addOrModifies(0, function () {
                deletes(0, function () {
                    theThis.findPropertyValues(function () {
                        theThis.findDifference();
                    });
                });
            });
        },
        computePropertyType: function (appId, key) {
            let started = false;
            for (let i = 0; i < this.inheritedAppRules.length; i++) {
                let appRule = this.inheritedAppRules[i];
                if (appRule.app.appId === appId) {
                    started = true;
                }
                if (started) {
                    for (let j = 0; j < appRule.rules.length; j++) {
                        let rule = appRule.rules[j];
                        let regex = rule.keyRegex;
                        if (!regex.startsWith('^')) {
                            regex = '^' + regex;
                        }
                        if (!regex.endsWith('$')) {
                            regex += '$';
                        }
                        if (new RegExp(regex).test(key)) {
                            return rule.propertyType;
                        }
                    }
                }
            }
            return 'READ_WRITE';
        },
        doFindProfile: function (profileId, processProfile) {
            axios.get('../manage/profile/findProfile', {
                params: {
                    profileId: profileId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                processProfile(result.profile);
            });
        },
        calcRowKey: function (row) {
            return row.key;
        },
        profilePropertySpanMethod: function ({row, column, rowIndex, columnIndex}) {
            if (columnIndex === 0) {
                if (rowIndex === 0) {
                    return [row.propertiesSize, 1];
                } else {
                    return [0, 0];
                }
            }
        },
        tableCellClassName: function ({row, column, rowIndex, columnIndex}) {
            if (columnIndex > 0 && !row.editing && !this.isValidKey(row.appId, row.profileId, row.key)) {
                return 'invalid-property';
            }
            return '';
        },
        emptyTableCellClassName: function ({row, column, rowIndex, columnIndex}) {
            if (columnIndex > 0) {
                return 'invalid-property';
            }
            return '';
        },
        profilePropertyEmptyOrShowTextSpanMethod: function ({row, column, rowIndex, columnIndex}) {
            if (rowIndex === 0) {
                if (columnIndex === 0) {
                    return [1, 1];
                } else if (columnIndex === 1) {
                    return [1, 4];
                } else if (columnIndex === 5) {
                    return [1, 1];
                } else {
                    return [0, 0];
                }
            }
        },
        isShowOverrideButton: function (row) {
            return !this.editingKeyProperties[row.key] && (this.isValidKey(row.appId, row.profileId, row.key) || (row.profileId === this.profileId && this.isValidPropertyKey(row.appId, row.key)));
        },
        isValidKey: function (appId, profileId, key) {
            let profileMap = this.keyValidityMap[appId];
            if (!profileMap) {
                return false;
            }
            let keyMap = profileMap[profileId];
            if (!keyMap) {
                return false;
            }
            return keyMap[key];
        },
        isValidPropertyKey: function (appId, key) {
            let keyMap = this.propertyKeyValidityMap[appId];
            if (!keyMap) {
                return false;
            }
            return keyMap[key];
        },
        startEditing: function (property) {
            property.editing = true;
            property.editingValue = property.value;
            property.editingScope = property.scope;
        },
        cancelEditing: function (property) {
            property.editing = false;
            property.editingValue = null;
            property.editingScope = null;
            if (property.temporary) {
                const theThis = this;
                this.appProperties.forEach(function (appProperty) {
                    if (appProperty.app.appId !== theThis.appId) {
                        return;
                    }
                    appProperty.profileProperties.forEach(function (profileProperty) {
                        if (profileProperty.profileId !== theThis.profileId) {
                            return;
                        }
                        for (let i = 0; i < profileProperty.properties.length; i++) {
                            let temp = profileProperty.properties[i];
                            if (temp.key === property.key) {
                                profileProperty.properties.splice(i, 1);
                                break;
                            }
                        }
                        profileProperty.properties.forEach(function (property) {
                            Vue.set(property, 'propertiesSize', profileProperty.properties.length);
                        });
                    });
                });
            }
        },
        saveEditing: function (property) {
            if (property.editingValue) {
                property.editingValue = property.editingValue.trim();
            }
            if (!property.editingValue) {
                Vue.prototype.$message.error('配置value不能为空');
                return;
            }
            this.addOrModifyPropertyValue(property.key, property.editingValue, property.editingScope);
        },
        addOrModifyPropertyValue: function (key, value, scope, callback) {
            const theThis = this;
            this.doAddOrModifyPropertyValue(key, value, scope, function () {
                theThis.findPropertyValues(function () {
                    theThis.findDifference(callback);
                });
            });
        },
        doAddOrModifyPropertyValue: function (key, value, scope, callback) {
            axios.get('../manage/propertyValue/addOrModifyPropertyValue', {
                params: {
                    appId: this.appId,
                    profileId: this.profileId,
                    branchId: this.branchId,
                    key: key,
                    value: value,
                    scope: scope
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                if (callback) {
                    callback();
                }
            });
        },
        deletePropertyValue: function (key, callback) {
            const theThis = this;
            this.doDeletePropertyValue(key, function () {
                theThis.findPropertyValues(function () {
                    theThis.findDifference(callback);
                });
            });
        },
        doDeletePropertyValue: function (key, callback) {
            axios.get('../manage/propertyValue/deletePropertyValue', {
                params: {
                    appId: this.appId,
                    profileId: this.profileId,
                    branchId: this.branchId,
                    key: key
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                if (callback) {
                    callback();
                }
            });
        },
        overrideProperty: function (property) {
            const theThis = this;

            if (this.showMode === 'table') {
                this.appProperties.forEach(function (appProperty) {
                    if (appProperty.app.appId !== theThis.appId) {
                        return;
                    }
                    appProperty.profileProperties.forEach(function (profileProperty) {
                        if (profileProperty.profileId !== theThis.profileId) {
                            return;
                        }
                        for (let temp in profileProperty.properties) {
                            if (temp.key === property.key) {
                                return;
                            }
                        }

                        let temp = {
                            appId: theThis.appId,
                            profileId: theThis.profileId,
                            key: property.key,
                            value: property.value,
                            scope: property.scope,
                            memo: property.memo,
                            propertyType: theThis.computePropertyType(theThis.appId, property.key),
                            editing: false,
                            editingValue: null,
                            editingScope: null,
                            temporary: true
                        };
                        profileProperty.properties.push(temp);
                        profileProperty.properties.forEach(function (property) {
                            Vue.set(property, 'propertiesSize', profileProperty.properties.length);
                        });
                        theThis.startEditing(temp);
                    });
                });
            } else if (this.showMode === 'text') {
                if (this.editingPropertyValuesInText.length > 0) {
                    this.editingPropertyValuesInText += '\n';
                }
                this.editingPropertyValuesInText += property.key + '=' + property.value;
            }
        },
        revertPropertyValues: function () {
            const theThis = this;

            this.doFindBranchRelease(this.appId, this.profileId, this.branchId, function (release) {
                axios.get('../manage/propertyValue/revertPropertyValues', {
                    params: {
                        appId: theThis.appId,
                        profileId: theThis.profileId,
                        branchId: theThis.branchId,
                        releaseVersion: release.version
                    }
                }).then(function (result) {
                    if (!result.success) {
                        Vue.prototype.$message.error(result.message);
                        return;
                    }
                    theThis.revertPopoverShowing = false;
                    theThis.findPropertyValues(function () {
                        theThis.findDifference();
                    });
                });
            });
        },
        closeAddPropertyValueDialog: function () {
            this.addPropertyValueDialogShowing = false;
            this.$refs['addPropertyValueForm'].resetFields();
        },
        addPropertyValue: function () {
            const theThis = this;
            this.$refs.addPropertyValueForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                theThis.addOrModifyPropertyValue(
                    theThis.addPropertyValueForm.key,
                    theThis.addPropertyValueForm.value,
                    theThis.addPropertyValueForm.scope,
                    function () {
                        theThis.closeAddPropertyValueDialog();
                    });
            });
        },
        showReleaseBranchDialog: function () {
            if (this.manager.type === 'NORMAL') {
                let keys = [];
                for (let i = 0; i < this.modifiedProperties.length; i++) {
                    let property = this.modifiedProperties[i];
                    if (property.propertyType !== 'READ_WRITE') {
                        keys.push(property.key);
                    }
                }
                if (keys.length > 0) {
                    Vue.prototype.$message.error("有敏感配置[" + keys + "]被修改，无权进行发布");
                    return;
                }
            }
            this.releaseBranchDialogVisible = true;
        },
        closeReleaseBranchDialog: function () {
            this.releaseBranchDialogVisible = false;
            this.$refs['releaseBranchForm'].resetFields();
        },
        releaseBranch: function () {
            const theThis = this;
            let propertyChange = {
                addedOrModifiedProperties: [],
                deletedKeys: []
            };
            this.modifiedProperties.forEach(function (property) {
                if (theThis.differenceForMap.addedKeys[property.key]
                    || theThis.differenceForMap.modifiedValueKeys[property.key]
                    || theThis.differenceForMap.modifiedScopeKeys[property.key]) {
                    propertyChange.addedOrModifiedProperties.push({
                        key: property.key,
                        value: property.value,
                        scope: property.scope
                    });
                } else if (theThis.differenceForMap.deletedKeys[property.key]) {
                    propertyChange.deletedKeys.push(property.key);
                }
            });
            this.doReleaseBranch(propertyChange, this.releaseBranchForm.memo, function () {
                theThis.closeReleaseBranchDialog();
                theThis.findAllData();
            });
        },
        doReleaseBranch: function (propertyChange, memo, callback) {
            axios.post('../manage/branch/releaseBranch', {
                appId: this.appId,
                profileId: this.profileId,
                branchId: this.branchId,
                propertyChange: JSON.stringify(propertyChange),
                memo: memo
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                Vue.prototype.$message.success(result.message);
                if (callback) {
                    callback(result.branch);
                }
            });
        },
        toShowingProfile: function (profile) {
            if (!profile) {
                return '';
            }
            let text = profile.profileId;
            if (profile.profileName) {
                text += '（' + profile.profileName + '）';
            }
            return text;
        },
        toShowingApp: function (app) {
            if (!app) {
                return '';
            }
            let text = app.appId;
            if (app.appName) {
                text += '（' + app.appName + '）';
            }
            return text;
        },
        findAllProfiles: function (callback) {
            const theThis = this;
            axios.get('../manage/profile/findProfileTree', {
                params: {
                    rootProfileId: null
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                let extractProfiles = function (profileTree, level) {
                    let profiles = [];
                    if (profileTree.profile !== null) {
                        profileTree.profile.level = level;
                        profiles.push(profileTree.profile);
                    }
                    profileTree.children.forEach(function (child) {
                        profiles = profiles.concat(extractProfiles(child, level + 1));
                    });
                    return profiles;
                };
                theThis.allProfiles = extractProfiles(result.profileTree, -1);
                if (callback) {
                    callback(theThis.allProfiles);
                }
            });
        },
        findBranches: function (callback) {
            const theThis = this;
            axios.get('../manage/branch/findBranches', {
                params: {
                    appId: theThis.appId,
                    profileId: theThis.profileId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.branches = result.branches;
                if (callback) {
                    callback(theThis.branches);
                }
            });
        },
        switchProfile: function (profileId) {
            this.branchId = 'master';
            this.$router.replace('/configs/' + this.appId + '/' + profileId);
        },
        findPropertyValues: function (callback) {
            const theThis = this;
            axios.get('../manage/propertyValue/findPropertyValues', {
                params: {
                    appId: this.appId,
                    profileId: this.profileId,
                    branchId: this.branchId,
                    minScope: 'PRIVATE'
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.propertyValues = result.propertyValues;
                if (callback) {
                    callback(theThis.propertyValues);
                }
            });
        },
        findDifference: function (callback) {
            const theThis = this;
            this.doFindBranchRelease(this.appId, this.profileId, this.branchId, function (release) {
                axios.get('../manage/propertyValue/comparePropertyValuesWithRelease', {
                    params: {
                        appId: theThis.appId,
                        profileId: theThis.profileId,
                        branchId: theThis.branchId,
                        releaseVersion: release.version
                    }
                }).then(function (result) {
                    if (!result.success) {
                        Vue.prototype.$message.error(result.message);
                        return;
                    }
                    theThis.difference = result.difference;
                    if (callback) {
                        callback(theThis.difference);
                    }
                });
            });
        },
        findInheritedAppReleases: function (callback) {
            const theThis = this;
            this.selfPropertiesLoading = true;
            axios.get('../manage/release/findInheritedAppReleases', {
                params: {
                    appId: this.appId,
                    profileId: this.profileId,
                    branchId: this.branchId
                }
            }).then(function (result) {
                theThis.selfPropertiesLoading = false;
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.inheritedAppReleases = result.inheritedAppReleases;
                if (callback) {
                    callback(theThis.inheritedAppReleases);
                }
            });
        },
        findInheritedAppPropertyKeys: function (callback) {
            const theThis = this;
            axios.get('../manage/propertyKey/findInheritedAppPropertyKeys', {
                params: {
                    appId: this.appId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.inheritedAppPropertyKeys = result.inheritedAppPropertyKeys;
                if (callback) {
                    callback(theThis.inheritedAppPropertyKeys);
                }
            });
        },
        findInheritedAppRules: function (callback) {
            const theThis = this;
            axios.get('../manage/propertyType/findInheritedAppRules', {
                params: {
                    appId: theThis.appId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.inheritedAppRules = result.inheritedAppRules;
                if (callback) {
                    callback(theThis.inheritedAppRules);
                }
            });
        },
        doFindBranchRelease: function (appId, profileId, branchId, callback) {
            axios.get('../manage/branch/findBranch', {
                params: {
                    appId: appId,
                    profileId: profileId,
                    branchId: branchId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                callback(result.branch.release);
            });
        }
    }
};