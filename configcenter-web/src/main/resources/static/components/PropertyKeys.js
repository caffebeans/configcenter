// 配置key管理组件
const PropertyKeysTemplate = `
<div id="propertyKeysApp">
    <el-row style="margin-bottom: 10px">
        <el-col :span="16">
            <span style="font-size: large;">环境：</span>
            <router-link v-for="(profile, index) in allProfiles" v-if="index < 8" :to="'/configs/' + appId + '/' + profile.profileId" :key="profile.profileId" style="margin-right: 10px">
                <el-button type="text">{{ profile.profileId }}</el-button>
            </router-link>
            <router-link v-if="allProfiles.length > 8" :to="'/configs/' + appId + '/' + allProfiles[0].profileId" style="margin-right: 10px">
                <el-button type="text" icon="el-icon-more"></el-button>
            </router-link>
        </el-col>
        <el-col :span="8" style="text-align: right;">
            <router-link :to="'/configs/' + appId + '/propertyTypes'">
                <el-button type="text">普通管理员权限</el-button>
            </router-link>
        </el-col>
    </el-row>
    <div v-for="appPropertyKey in appPropertyKeys" style="margin-bottom: 30px">
        <el-row v-if="appPropertyKey.app.appId === appId" style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center;">
                <span style="font-size: x-large;color: #409EFF;">{{ toShowingApp(appPropertyKey.app) }}</span>
            </el-col>
            <el-col :span="4" style="text-align: end;">
                <el-button type="primary" icon="el-icon-plus" @click="addPropertyKeyVisible = true" size="small">新增配置key</el-button>
            </el-col>
        </el-row>
        <el-row v-else style="margin-bottom: 10px">
            <el-col :offset="4" :span="16" style="text-align: center">
                <span style="font-size: large;color: #67c23a;">{{ toShowingApp(appPropertyKey.app) }}</span>
            </el-col>
        </el-row>
        <el-table :data="appPropertyKey.propertyKeys"
                  :key="appPropertyKey.app.appId"
                  :default-sort="{prop: 'key'}"
                  :style="{width: appPropertyKey.app.appId === appId ? '100%' : 'calc(100% - 130px)'}"
                  :cell-style="{padding: '3px 0px'}"
                  border stripe>
            <el-table-column prop="key" label="配置key" sortable>
                <template slot-scope="{ row }">
                    <span class="propertyKey-text-style">{{ row.key }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="memo" label="备注">
                <template slot-scope="{ row }">
                    <span v-if="!row.editing" class="propertyKey-text-style">{{ row.memo }}</span>
                    <el-input v-else v-model="row.editingMemo" size="mini" clearable placeholder="请输入备注"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="scope" label="作用域" sortable width="120px">
                <template slot-scope="{ row }">
                    <div v-if="!row.editing">
                        <el-tag v-if="row.scope === 'PRIVATE'" size="medium">私有</el-tag>
                        <el-tag v-else-if="row.scope === 'PROTECTED'" type="success" size="medium">可继承</el-tag>
                        <el-tag v-else-if="row.scope === 'PUBLIC'" type="warning" size="medium">公开</el-tag>
                    </div>
                    <el-select v-else v-model="row.editingScope" size="mini" placeholder="请选择作用域" style="width: 90%">
                        <el-option value="PRIVATE" label="私有" size="medium"></el-option>
                        <el-option value="PROTECTED" label="可继承" size="medium"></el-option>
                        <el-option value="PUBLIC" label="公开" size="medium"></el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column prop="propertyType" label="普通管理员权限" sortable width="150px">
                <template slot-scope="{ row }">
                    <el-tag v-if="row.propertyType === 'READ_WRITE'" type="success" size="medium">读写</el-tag>
                    <el-tag v-else-if="row.propertyType === 'READ'" type="warning" size="medium">只读</el-tag>
                    <el-tag v-else-if="row.propertyType === 'NONE'" type="danger" size="medium">无</el-tag>
                </template>
            </el-table-column>
            <el-table-column v-if="appPropertyKey.app.appId === appId" label="操作" header-align="center" width="130px">
                <template slot-scope="{ row }">
                    <el-row>
                        <el-col :span="16" style="text-align: center">
                            <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="startEditing(row)" type="primary" :disabled="manager.type==='NORMAL' && row.propertyType!=='READ_WRITE'" icon="el-icon-edit" size="mini" circle></el-button>
                            </el-tooltip>
                            <template v-else>
                                <el-button-group>
                                    <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="row.editing = false" type="info" icon="el-icon-close" size="mini" circle></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="保存修改" placement="top" :open-delay="1000" :hide-after="3000">
                                        <el-button @click="saveEditing(row)" type="success" icon="el-icon-check" size="mini" circle></el-button>
                                    </el-tooltip>
                                </el-button-group>
                            </template>
                        </el-col>
                        <el-col :span="8" style="text-align: center">
                            <el-tooltip content="删除" placement="top" :open-delay="1000" :hide-after="3000">
                                <el-button @click="deletePropertyKey(row)" type="danger" :disabled="manager.type==='NORMAL' && row.propertyType!=='READ_WRITE'" icon="el-icon-delete" size="mini" circle></el-button>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <el-dialog :visible.sync="addPropertyKeyVisible" :before-close="closeAddPropertyKeyDialog" title="新增配置key" width="40%">
        <el-form ref="addPropertyKeyForm" :model="addPropertyKeyForm" label-width="20%">
            <el-form-item label="配置key" prop="key" :rules="[{required:true, message:'请输入配置key', trigger:'blur'}]">
                <el-input v-model="addPropertyKeyForm.key" clearable placeholder="请输入配置key" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="作用域" prop="scope" :rules="[{required:true, message:'请选择作用域', trigger:'blur'}]">
                <el-select v-model="addPropertyKeyForm.scope" placeholder="请选择作用域" style="width: 90%">
                    <el-option value="PRIVATE" label="私有"></el-option>
                    <el-option value="PROTECTED" label="可继承"></el-option>
                    <el-option value="PUBLIC" label="公开"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="addPropertyKeyForm.memo" clearable placeholder="请输入备注" style="width: 90%"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeAddPropertyKeyDialog">取消</el-button>
            <el-button type="primary" @click="addPropertyKey">提交</el-button>
        </div>
    </el-dialog>
</div>
`;

const PropertyKeys = {
    template: PropertyKeysTemplate,
    props: ['appId'],
    data: function () {
        return {
            manager: CURRENT_MANAGER,
            profileTree: null,
            appPropertyKeys: [],
            inheritedAppPropertyKeys: [],
            inheritedAppRules: [],
            addPropertyKeyVisible: false,
            addPropertyKeyForm: {
                key: null,
                scope: null,
                memo: null
            }
        };
    },
    computed: {
        allProfiles: function () {
            if (this.profileTree === null) {
                return [];
            }
            let extractProfiles = function (profileTree, level) {
                let profiles = [];
                if (profileTree.profile !== null) {
                    profiles.push({
                        profileId: profileTree.profile.profileId,
                        profileName: profileTree.profile.profileName,
                        parent: profileTree.profile.parent,
                        level: level
                    });
                }
                profileTree.children.forEach(function (child) {
                    profiles = profiles.concat(extractProfiles(child, level + 1));
                });
                return profiles;
            };
            return extractProfiles(this.profileTree, -1);
        }
    },
    watch: {
        inheritedAppPropertyKeys: function () {
            this.refreshAppPropertyKeys();
        },
        inheritedAppRules: function () {
            this.refreshAppPropertyKeys();
        }
    },
    created: function () {
        this.findProfileTree();
        this.findInheritedAppPropertyKeys();
        this.findInheritedAppRules();
    },
    methods: {
        refreshAppPropertyKeys: function () {
            const theThis = this;
            let appPropertyKeys = [];
            this.inheritedAppPropertyKeys.forEach(function (inheritedAppPropertyKey) {
                let appPropertyKey = {
                    app: inheritedAppPropertyKey.app,
                    propertyKeys: [],
                };
                inheritedAppPropertyKey.propertyKeys.forEach(function (propertyKey) {
                    appPropertyKey.propertyKeys.push({
                        appId: propertyKey.appId,
                        key: propertyKey.key,
                        scope: propertyKey.scope,
                        memo: propertyKey.memo,
                        propertyType: theThis.computePropertyType(propertyKey.appId, propertyKey.key),
                        editing: false,
                        editingScope: null,
                        editingMemo: null
                    })
                });

                appPropertyKeys.push(appPropertyKey);
            });

            this.appPropertyKeys = appPropertyKeys;
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
        findProfileTree: function (callback) {
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
                theThis.profileTree = result.profileTree;
                if (callback) {
                    callback(theThis.profileTree);
                }
            });
        },
        findInheritedAppPropertyKeys: function (callback) {
            const theThis = this;
            axios.get('../manage/propertyKey/findInheritedAppPropertyKeys', {
                params: {
                    appId: theThis.appId
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
        startEditing: function (propertyKey) {
            propertyKey.editing = true;
            propertyKey.editingScope = propertyKey.scope;
            propertyKey.editingMemo = propertyKey.memo;
        },
        saveEditing: function (propertyKey) {
            const theThis = this;
            this.doAddOrModifyPropertyKey(propertyKey.key, propertyKey.editingScope, propertyKey.editingMemo, function () {
                theThis.findInheritedAppPropertyKeys();
            });
        },
        deletePropertyKey: function (propertyKey) {
            const theThis = this;
            Vue.prototype.$confirm('确定删除配置key？', '警告', {type: 'warning'})
                .then(function () {
                    axios.post('../manage/propertyKey/deletePropertyKey', {
                        appId: propertyKey.appId,
                        key: propertyKey.key
                    }).then(function (result) {
                        if (!result.success) {
                            Vue.prototype.$message.error(result.message);
                            return;
                        }
                        Vue.prototype.$message.success(result.message);
                        theThis.findInheritedAppPropertyKeys();
                    });
                });
        },
        addPropertyKey: function () {
            const theThis = this;
            this.$refs.addPropertyKeyForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                theThis.doAddOrModifyPropertyKey(theThis.addPropertyKeyForm.key, theThis.addPropertyKeyForm.scope, theThis.addPropertyKeyForm.memo, function () {
                    theThis.closeAddPropertyKeyDialog();
                    theThis.findInheritedAppPropertyKeys();
                });
            })
        },
        doAddOrModifyPropertyKey: function (key, scope, memo, callback) {
            axios.post('../manage/propertyKey/addOrModifyPropertyKey', {
                appId: this.appId,
                key: key,
                scope: scope,
                memo: memo
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                Vue.prototype.$message.success(result.message);
                if (callback) {
                    callback();
                }
            });
        },
        closeAddPropertyKeyDialog: function () {
            this.addPropertyKeyVisible = false;
            this.addPropertyKeyForm.key = null;
            this.addPropertyKeyForm.scope = null;
            this.addPropertyKeyForm.memo = null;
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
        }
    }
};