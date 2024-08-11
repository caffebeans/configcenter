// 分支管理组件
const BranchesTemplate = `
<div id="branchesApp">
    <el-row>
        <el-col>
            <span style="font-size: medium;color: #409EFF;">应用：</span><span style="font-size: medium;">{{ toShowingApp(app) }}</span>
            <span style="font-size: medium;color: #409EFF;margin-left: 20px">环境：</span><span style="font-size: medium;">{{ toShowingProfile(profile) }}</span>
        </el-col>
    </el-row>
    <br/>
    <el-row>
        <el-col>
            <span style="font-size: larger;margin-right: 50px">分支：</span>
            <el-button type="primary" icon="el-icon-plus" size="small" @click="addBranchDialogVisible = true">新增</el-button>
        </el-col>
    </el-row>
    <el-table :data="branches" border stripe>
        <el-table-column prop="branchId" label="分支id"></el-table-column>
        <el-table-column prop="release" label="发布版本">
            <template slot-scope="{ row }">
                <span>{{ row.release.version }}</span>
                <span v-if="row.release.memo">({{ row.release.memo }})</span>
            </template>
        </el-table-column>
        <el-table-column label="操作" header-align="center" align="center" width="250px">
            <template slot-scope="{ row }">
                <el-tooltip content="合并分支" placement="top" :open-delay="1000" :hide-after="3000">
                    <el-button @click="mergeBranchForm.sourceBranchId=row.branchId; mergeBranchDialogVisible = true" size="small">Merge Request</el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top" :open-delay="1000" :hide-after="3000">
                    <el-button @click="deleteBranch(row)" :disabled="row.branchId === 'master'" type="danger" icon="el-icon-delete" size="small" circle></el-button>
                </el-tooltip>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog :visible.sync="addBranchDialogVisible" :before-close="closeAddBranchDialog" title="新增分支" width="50%">
        <el-form ref="addBranchForm" :model="addBranchForm" label-width="20%">
            <el-form-item label="分支id" prop="branchId" :rules="[{required:true, message:'请输入分支id', trigger:'blur'}]">
                <el-input v-model="addBranchForm.branchId" clearable placeholder="请输入分支id" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="源分支id" prop="sourceBranchId" :rules="[{required:true, message:'请输入源分支id', trigger:'blur'}]">
                <el-select v-model="addBranchForm.sourceBranchId" clearable placeholder="请输入源分支id" style="width: 90%">
                    <el-option v-for="branch in branches" :value="branch.branchId" :label="branch.branchId" :key="branch.branchId"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeAddBranchDialog">取消</el-button>
            <el-button type="primary" @click="addBranch">提交</el-button>
        </div>
    </el-dialog>
    <el-dialog :visible.sync="mergeBranchDialogVisible" :before-close="closeMergeBranchDialog" title="分支合并" width="70%">
        <el-form ref="mergeBranchForm" :model="mergeBranchForm" label-width="12.5%">
            <el-form-item label="源分支id" prop="sourceBranchId" :rules="[{required:true, message:'请输入源分支id', trigger:'blur'}]">
                <el-input v-model="mergeBranchForm.sourceBranchId" :disabled="true" placeholder="请输入源分支id" style="width: 100%"></el-input>
            </el-form-item>
            <el-form-item label="目标分支id" prop="branchId" :rules="[{required:true, message:'请输入目标分支id', trigger:'blur'}]">
                <el-select v-model="mergeBranchForm.branchId" @change="refreshComputedBranchMergence" clearable placeholder="请输入目标分支id" style="width: 100%">
                    <el-option v-for="branch in branches" v-if="branch.branchId !== mergeBranchForm.sourceBranchId" :value="branch.branchId" :label="branch.branchId" :key="branch.branchId"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <el-row>
            <el-col :span="3" style="text-align: right;">
                <span style="margin-right: 12px">合并的变更</span>
            </el-col>
            <el-col :span="21">
                <el-table :data="computedBranchMergence.changedProperties"
                          :default-sort="{prop: 'key'}"
                          :cell-style="{padding: '5px 0px'}"
                          border>
                    <el-table-column prop="key" label="配置key">
                        <template slot-scope="{ row }">
                            <el-badge v-if="computedBranchMergence.difference.addedKeys.indexOf(row.key) >= 0" type="success" value="新" class="badge-style">
                                <span class="badged-text-style propertyValue-text-style">{{ row.key }}</span>
                            </el-badge>
                            <el-badge v-else-if="computedBranchMergence.difference.deletedKeys.indexOf(row.key) >= 0" type="danger" value="删" class="badge-style">
                                <span class="badged-text-style propertyValue-text-style">{{ row.key }}</span>
                            </el-badge>
                            <span v-else class="propertyValue-text-style">{{ row.key }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="配置value">
                        <template slot-scope="{ row }">
                            <template v-if="computedBranchMergence.difference.modifiedValueKeys.indexOf(row.key) >= 0">
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
                            <template v-if="computedBranchMergence.difference.modifiedScopeKeys.indexOf(row.key) >= 0">
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
        <div slot="footer">
            <el-button @click="closeMergeBranchDialog">取消</el-button>
            <el-button type="primary" @click="mergeBranch" :disabled="computedBranchMergence.changedProperties.length<=0">提交</el-button>
        </div>
    </el-dialog>
    <br/><br/><br/>
    <el-row>
        <el-col>
            <span style="font-size: larger;margin-right: 20px">分支规则：</span>
            <el-button type="primary" icon="el-icon-plus" size="small" @click="addBranchRuleDialogVisible = true">新增</el-button>
        </el-col>
        <el-col>
            <span style="font-size: x-small;">用于配置灰度发布。默认使用master分支的配置，但如果客户端的target属性与某条分支规则的正则表达式匹配，则使用对应分支的配置。</span>
        </el-col>
    </el-row>
    <el-table :data="branchRules"
              :default-sort="{prop: 'priority'}"
              border stripe>
        <el-table-column prop="branchId" label="分支id"></el-table-column>
        <el-table-column prop="rule" label="客户端target规则（正则表达式）">
            <template slot-scope="{ row }">
                <span v-if="!row.editing">{{ row.rule }}</span>
                <el-input v-else v-model="row.editingRule" size="small" clearable placeholder="请输入客户端target规则"></el-input>
            </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级（值越小优先级越高）">
            <template slot-scope="{ row }">
                <span v-if="!row.editing">{{ row.priority }}</span>
                <el-input-number v-else v-model="row.editingPriority" size="small" :min="0" controls-position="right"></el-input-number>
            </template>
        </el-table-column>
        <el-table-column label="操作" header-align="center" width="160px">
            <template slot-scope="{ row }">
                <el-row>
                    <el-col :span="12" style="text-align: center">
                        <el-tooltip v-if="!row.editing" content="修改" placement="top" :open-delay="1000" :hide-after="3000">
                            <el-button @click="startEditingBranchRule(row)" type="primary" icon="el-icon-edit" size="small" circle></el-button>
                        </el-tooltip>
                        <template v-else>
                            <el-button-group>
                                <el-tooltip content="取消修改" placement="top" :open-delay="1000" :hide-after="3000">
                                    <el-button @click="row.editing = false" type="info" icon="el-icon-close" size="small" circle></el-button>
                                </el-tooltip>
                                <el-tooltip content="保存修改" placement="top" :open-delay="1000" :hide-after="3000">
                                    <el-button @click="saveEditingBranchRule(row)" type="success" icon="el-icon-check" size="small" circle></el-button>
                                </el-tooltip>
                            </el-button-group>
                        </template>
                    </el-col>
                    <el-col :span="12" style="text-align: center">
                        <el-tooltip content="删除" placement="top" :open-delay="1000" :hide-after="3000">
                            <el-button @click="deleteBranchRule(row)" type="danger" icon="el-icon-delete" size="small" circle></el-button>
                        </el-tooltip>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog :visible.sync="addBranchRuleDialogVisible" :before-close="closeAddBranchRuleDialog" title="新增分支规则" width="40%">
        <el-form ref="addBranchRuleForm" :model="addBranchRuleForm" label-width="20%">
            <el-form-item label="分支id" prop="branchId" :rules="[{required:true, message:'请输入分支id', trigger:'blur'}]">
                <el-select v-model="addBranchRuleForm.branchId" clearable placeholder="请输入分支id" style="width: 90%">
                    <el-option v-for="branch in addBranchRuleDialogBranches" :value="branch.branchId" :label="branch.branchId" :key="branch.branchId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="规则" prop="rule" :rules="[{required:true, message:'请输入客户端target规则', trigger:'blur'}]">
                <el-input v-model="addBranchRuleForm.rule" clearable placeholder="请输入客户端target规则" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="优先级" prop="priority" :rules="[{required:true, message:'请输入优先级', trigger:'blur'}]">
                <el-input-number v-model="addBranchRuleForm.priority" :min="0" controls-position="right" style="width: 90%"></el-input-number>
            </el-form-item>
        </el-form>
        <div slot="footer">
            <el-button @click="closeAddBranchRuleDialog">取消</el-button>
            <el-button type="primary" @click="addBranchRule">提交</el-button>
        </div>
    </el-dialog>
</div>
`;

const Branches = {
    template: BranchesTemplate,
    props: ['appId', 'profileId'],
    data: function () {
        return {
            manager: CURRENT_MANAGER,
            app: {},
            profile: {},
            branches: [],
            inheritedAppRules: [],
            addBranchDialogVisible: false,
            addBranchForm: {
                branchId: null,
                sourceBranchId: null
            },
            mergeBranchDialogVisible: false,
            mergeBranchForm: {
                branchId: null,
                sourceBranchId: null
            },
            computedBranchMergence: {
                changedProperties: [],
                difference: {}
            },
            branchRules: [],
            addBranchRuleDialogVisible: false,
            addBranchRuleForm: {
                branchId: null,
                priority: null,
                rule: null
            }
        };
    },
    computed: {
        addBranchRuleDialogBranches: function () {
            let branchIds = [];
            this.branchRules.forEach(function (branchRule) {
                branchIds.push(branchRule.branchId);
            });
            let branches = [];
            this.branches.forEach(function (branch) {
                if (branchIds.indexOf(branch.branchId) < 0) {
                    branches.push(branch);
                }
            });
            return branches;
        }
    },
    created: function () {
        this.findApp(this.appId);
        this.findProfile(this.profileId);
        this.findBranches();
        this.findInheritedAppRules();
        this.findBranchRules();
    },
    methods: {
        findApp: function (appId) {
            const theThis = this;
            axios.get('../manage/app/findApp', {
                params: {
                    appId: appId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.app = result.app;
            });
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
        findProfile: function (profileId) {
            const theThis = this;
            axios.get('../manage/profile/findProfile', {
                params: {
                    profileId: profileId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                theThis.profile = result.profile;
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
        findBranches: function () {
            const theThis = this;
            axios.get('../manage/branch/findBranches', {
                params: {
                    appId: theThis.appId,
                    profileId: theThis.profileId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                }
                theThis.branches = result.branches;
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
        closeAddBranchDialog: function () {
            this.addBranchDialogVisible = false;
            this.addBranchForm.branchId = null;
            this.addBranchForm.sourceBranchId = null;
        },
        addBranch: function () {
            const theThis = this;
            theThis.$refs.addBranchForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                let sourceBranch = null;
                for (let i = 0; i < theThis.branches.length; i++) {
                    if (theThis.branches[i].branchId === theThis.addBranchForm.sourceBranchId) {
                        sourceBranch = theThis.branches[i];
                        break;
                    }
                }
                if (!sourceBranch) {
                    Vue.prototype.$message.error('源分支[' + theThis.addBranchForm.sourceBranchId + ']不存在');
                    return;
                }
                theThis.doAddBranch(
                    theThis.appId,
                    theThis.profileId,
                    theThis.addBranchForm.branchId,
                    sourceBranch.release.version,
                    function () {
                        theThis.findBranches();
                        theThis.closeAddBranchDialog();
                    });
            });
        },
        doAddBranch: function (appId, profileId, branchId, releaseVersion, callback) {
            axios.post('../manage/branch/addBranch', {
                appId: appId,
                profileId: profileId,
                branchId: branchId,
                releaseVersion: releaseVersion
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
        closeMergeBranchDialog: function () {
            this.mergeBranchDialogVisible = false;
            this.mergeBranchForm.branchId = null;
            this.mergeBranchForm.sourceBranchId = null;
            this.computedBranchMergence = {
                changedProperties: [],
                difference: {}
            };
        },
        mergeBranch: function () {
            const theThis = this;
            theThis.$refs.mergeBranchForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                theThis.doMergeBranch(
                    theThis.appId,
                    theThis.profileId,
                    theThis.mergeBranchForm.branchId,
                    theThis.mergeBranchForm.sourceBranchId,
                    function () {
                        theThis.findBranches();
                        theThis.closeMergeBranchDialog();
                    });
            });
        },
        doMergeBranch: function (appId, profileId, branchId, sourceBranchId, callback) {
            axios.post('../manage/branch/mergeBranch', {
                appId: appId,
                profileId: profileId,
                branchId: branchId,
                sourceBranchId: sourceBranchId
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
        refreshComputedBranchMergence: function () {
            const theThis = this;
            axios.get('../manage/branch/computeBranchMergence', {
                params: {
                    appId: theThis.appId,
                    profileId: theThis.profileId,
                    branchId: theThis.mergeBranchForm.branchId,
                    sourceBranchId: theThis.mergeBranchForm.sourceBranchId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                }
                let computedBranchMergence = {
                    changedProperties: [],
                    difference: result.difference
                };
                result.changedProperties.forEach(function (property) {
                    computedBranchMergence.changedProperties.push({
                        key: property.key,
                        value: property.value,
                        scope: property.scope,
                        propertyType: theThis.computePropertyType(theThis.appId, property.key)
                    });
                });
                theThis.computedBranchMergence = computedBranchMergence;
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
        deleteBranch: function (branch) {
            const theThis = this;
            Vue.prototype.$confirm('确定删除分支？', '警告', {type: 'warning'})
                .then(function () {
                    axios.post('../manage/branch/deleteBranch', {
                        appId: branch.appId,
                        profileId: branch.profileId,
                        branchId: branch.branchId
                    }).then(function (result) {
                        if (!result.success) {
                            Vue.prototype.$message.error(result.message);
                            return;
                        }
                        Vue.prototype.$message.success(result.message);
                        theThis.findBranches();
                        theThis.findBranchRules();
                    });
                });
        },
        findBranchRules: function () {
            const theThis = this;
            axios.get('../manage/branchRule/findBranchRules', {
                params: {
                    appId: theThis.appId,
                    profileId: theThis.profileId
                }
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                result.branchRules.forEach(function (branchRule) {
                    branchRule.editing = false;
                    branchRule.editingPriority = null;
                    branchRule.editingRule = null;
                });
                theThis.branchRules = result.branchRules;
            });
        },
        startEditingBranchRule: function (branchRule) {
            branchRule.editing = true;
            branchRule.editingRule = branchRule.rule;
            branchRule.editingPriority = branchRule.priority;
        },
        saveEditingBranchRule: function (branchRule) {
            const theThis = this;
            Vue.prototype.$confirm('确定修改分支规则？', '警告', {type: 'warning'})
                .then(function () {
                    theThis.doAddOrModifyBranchRule(
                        branchRule.appId,
                        branchRule.profileId,
                        branchRule.branchId,
                        branchRule.editingRule,
                        branchRule.editingPriority,
                        function () {
                            theThis.findBranchRules();
                        });
                });
        },
        closeAddBranchRuleDialog: function () {
            this.addBranchRuleDialogVisible = false;
            this.addBranchRuleForm.branchId = null;
            this.addBranchRuleForm.rule = null;
            this.addBranchRuleForm.priority = null;
        },
        addBranchRule: function () {
            const theThis = this;
            theThis.$refs.addBranchRuleForm.validate(function (valid) {
                if (!valid) {
                    return;
                }
                theThis.doAddOrModifyBranchRule(
                    theThis.appId,
                    theThis.profileId,
                    theThis.addBranchRuleForm.branchId,
                    theThis.addBranchRuleForm.rule,
                    theThis.addBranchRuleForm.priority,
                    function () {
                        theThis.closeAddBranchRuleDialog();
                        theThis.findBranchRules();
                    });
            });
        },
        doAddOrModifyBranchRule: function (appId, profileId, branchId, rule, priority, callback) {
            axios.post('../manage/branchRule/addOrModifyBranchRule', {
                appId: appId,
                profileId: profileId,
                branchId: branchId,
                rule: rule,
                priority: priority
            }).then(function (result) {
                if (!result.success) {
                    Vue.prototype.$message.error(result.message);
                    return;
                }
                Vue.prototype.$message.success(result.message);
                callback();
            });
        },
        deleteBranchRule: function (branchRule) {
            const theThis = this;
            Vue.prototype.$confirm('确定删除分支规则？', '警告', {type: 'warning'})
                .then(function () {
                    axios.post('../manage/branchRule/deleteBranchRule', {
                        appId: branchRule.appId,
                        profileId: branchRule.profileId,
                        branchId: branchRule.branchId
                    }).then(function (result) {
                        if (!result.success) {
                            Vue.prototype.$message.error(result.message);
                            return;
                        }
                        Vue.prototype.$message.success(result.message);
                        theThis.findBranchRules();
                    });
                });
        }
    }
};