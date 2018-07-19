


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 Purpose      : FHRIS424

 Date         : 17 Jul 2018
 Author       : Eva Liao (ISD/CSC)
 Note         : 
 -------------------------------------------------
 17 Jul 2018	Eva Liao (ISD/CSC)	the first version

	the latest update: 17 Jul 2018 11:02
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

$(function () {
    //初始化语言
    LangInit();

    FHRIS424Page.init();
});

var FHRIS424Page = {
        apiUrl: '../View/Api/FHRIS424Api.ashx?',

        process: $(parent.document).find("#background,#progressBar"),

        // 控制网页控件的可用性
        enable: true,

        init: function () {

            this.initKendoControls();

            this.bindViewModel();

            this.setConstraintToField();

            this.addHoverEffect();

            this.process.hide();

			this.checkIsLock();
            // 对页面状态进行管理
			$('#btnDelete').parent().hide();
            switch (Action.toLowerCase()) {
                case 'view':
                    this.setPageOnViewStatus();
                    break;
                case 'edit':
                    this.setPageOnEditStatus();
                    break;
                default:
                    $('#btnEdit').parent().hide();
            };

            $('#content').find('.k-input:visible, .k-textbox:enabled').focusNextByEnter();

            $.lockWhenEdit(FHRIS424Page.apiUrl, Action, ViewModel.data.RID);
        },

        // 初始化kendo控件
        initKendoControls: function () {
            var _this = this;

            if (Action.toLowerCase() === 'view') {
                _this.enable = false;
            }

            //初始化Kendo验证控件
            $("#content").kendoValidator({
                validateOnBlur: false
            });

							
							$("#txt_Emp_No").kendoMaskedTextBox();
							
							
							this.initKendoDateControl($("#txt_Effect_Date"))
							
							
							$("#txt_Customer_id").kendoMaskedTextBox();
							
							
							$("#txt_Cost_Ratio").kendoMaskedTextBox();
							

        },

								
								// 生成日期控件
								initKendoDateControl: function (target) {
									target.kendoDatePicker({
										format: "dd MMM yyyy",
										parseFormats: ["yyyy-MM-dd"]
									}).data('kendoDatePicker').enable(this.enable);

									// 失去焦点时判断日期合法性
									target.on('blur', function () {
										$(this).kendoDateCheck();
									});
								},
								

        // 获取数据源 
        getDataSource: function (action) {
            return new kendo.data.DataSource({
                transport: {
                    read: {
                        url: this.apiUrl + "action=" + action,
                        dataType: "json",
                        cache: false
                    }
                }
            });
        },

        // 检查数据是否被修改过
        checkIsModifyData: function () {
            return ( ViewModel.data.dirty || $('#grid .k-dirty-cell').length > 0 );
        },

        // 给button添加hover效果
        addHoverEffect: function() {
            $(".toolBar > li").addHoverClass();
        },

        // 刷新对应的index页面
        refreshIndex: function () {
            $.refreshIndex('FHRIS424Index.aspx', 'btnRefresh');
        },

        // 检查是否被上锁
        checkIsLock: function () {
            //如果该单被锁住，则进行提示
            if (FlashMessage.length > 0) {
                $.showNotification(FlashMessage, "error");
            }
        },

        // 通过后台返回的信息，给输入框加上长度限制
        setConstraintToField: function () {
            $.ajax({
                type: "get",
                url:  FHRIS424Page.apiUrl + "action=GetFHRIS424ValidationDefine",
                dataType: "json",
                success: function (result) {
                    var fieldsElements = $("#content").find("[data-bind]");

                    fieldsElements.each(function () {
                    var _dataBind = $(this).attr('data-bind');

                    for (var m in result) {
                        if (_dataBind.match(result[m].ColumnName + "$")) {
                            // 限制输入长度
                            if (result[m].DataType.match('System.String')) {
                                $(this).attr('maxlength', result[m].ColumnSize);
                            }

                            // Key值在Edit状态下不可编辑
                            if (result[m].IsKey === true) {
                                Action === 'edit' && $(this).attr('disable', 'disabled');
                            }
                            break;
                        }
                    }
                });
                },
                error: function () {
                    console.error('ajax error: setMaxLengthToField request failed, pls check.');
                }
            });
        },

        // 配置页面的快捷键
        setShortcuts: function() {
            $(document).on('keydown', function(e) {
                var ctrlKey = e.ctrlKey || e.metaKey;
                if (ctrlKey) {
                    var keyCode = e.keyCode || e.which || e.charCode;
                    // ctrl+s
                    if (ctrlKey && keyCode == 83) {
                        $('#btnSave').trigger('click');
                        e.preventDefault();
                        return false;
                    }
                    // ctrl+q
                    if (ctrlKey && keyCode == 81) {
                        $('#btnExit').trigger('click');
                        e.preventDefault();
                        return false;
                    }
                }
            })
        },

        // 绑定ViewModel到页面
        bindViewModel: function () {
            $.getJSON(this.apiUrl + "action=Get&key=" + GUID, function (result) {
                if (result && result.IsSuccess) {
                    ViewModel.data = new kendo.data.Model(result.Data);
                    kendo.bind($('.page'), ViewModel);
                    ViewModel.data.trigger("change");
					ViewModel.data.dirty = false;
                } else {
                    $.showNotification(result.Message, "error");
                }
            });
        },

        // View状态时的页面管理
        setPageOnViewStatus: function () {
            var _this = this,
                isSave = $.getParameter(location.href, 'isSave');

            if (isSave == "Y") {
                $.showNotification(Language.GetText(FunctionID + "." + PageID + ".Save", "CN:保存成功.~EN:Save successful."), "success");
				//$.showNotification("Save successful.", "success");
            }  

            // 查看状态下，另这些控件失效
            $(".container-fluid").find("input").attr('disabled', 'true');
            $("#btnSave").parent().hide();
			$('#btnDelete').parent().show();
        },

        // Edit状态时的页面管理
        setPageOnEditStatus: function () {
            $('#btnEdit').parent().hide();
			//主键不可编辑
        }
    },
    ViewModel = {
        // 存放数据
        data: {},

        // 编辑
        edit: function () {
            location.href = location.href.replace(/action=\w+/, "action=edit").replace(/isSave=\w+/, "");
        },
		
		        // 删除
        delete0: function () {
            if (confirm("Are you sure to delete?")) {
                var rid = ViewModel.data.RID;

                $.showCover();

                $.ajax({
                    type: "post",
                    url: FHRIS424Page.apiUrl+"action=Delete&key=" + rid,
                    dataType: "json",
                    success: function (result) {
                        $.hideCover();

                        if (result.IsSuccess) {
                            FHRIS424Page.refreshIndex();
                            //                            $.showNotification(Language.GetText(FunctionID + "." + PageID + ".DeleteResult", "CN:刪除成功~EN:Deleted success"), "success");
                            $.showNotification("Deleted success", "success");
                            setTimeout(function () { $('#btnExit').trigger('click'); }, 3000);
                        } else {
                            $.showNotification(result.Message, "error");
                        }
                    },
                    error: function () {
                        $.hideCover();
                        console.error('ajax error: delete request failed, pls check.');
                    }
                });
            }
        },
		

        // 保存
        save: function () {
            var validatable = $("#content").kendoValidator().data("kendoValidator");

            //前台是否通过验证
            if (validatable.validate()) {
                $.showCover();
                if (Action.toLowerCase() === 'add' || Action.toLowerCase() === 'copytonew') {
                    if (!ViewModel.data.RID) {
                        ViewModel.data.RID = GUID;
                    }
			                }
				
						
                $.ajax({
                    type: "post",
                    dataType: "json",
                    url: FHRIS424Page.apiUrl + "action=Updata&key=" + GUID, 
                    data: {
                        model: JSON.stringify(ViewModel.data)
                    },
                    success: function (result) {
                        $.hideCover();
                        if (result.IsSuccess) {
                            ViewModel.data = new kendo.data.Model(result.Data);
                            FHRIS424Page.refreshIndex();
                            if (Action == "add") {
                                location.href = location.href.replace(/action=\w+/, "action=view").replace(/isSave=\w+/, "").replace(/key=\w+[-]\w+[-]\w+[-]\w+[-]\w+/, "key=" + ViewModel.data.RID + "&isSave=Y&");
                            } else {
                                location.href = location.href.replace(/action=\w+/, "action=view").replace(/isSave=\w+/, "").replace(/key=\w+/, "key=" + ViewModel.data.RID + "&isSave=Y&");
                            }
//                            $.showNotification("Save successful.", "success");
//                            setTimeout(function () {
//                                var a = parent.navTab;
//                                a.closeCurrentTab(); //关闭当前标签页
//                                a._switchTab(a._indexTabId('pageHRIS424')); //跳转至index页面
//                            }, 3500);
                        } else {
                            $.showNotification(result.Message, 'error');
                        }
                    },
                    error: function () { 
                        console.error('ajax error: save request failed, pls check.');
                    }
                });
            }
        },

        // 退出
        exit: function () {
            if ( FHRIS424Page.checkIsModifyData() ) {
                var exitTips = Language.GetText(FunctionID + "." + PageID + ".exit", "CN:数据尚未保存，是否确认退出？~EN:Are you sure to exit without saving?");
				//var exitTips = "Are you sure to exit without saving?";
                confirm(exitTips) && parent.navTab.closeCurrentTab();
            } else {
                parent.navTab.closeCurrentTab();
            }            
        }
    };