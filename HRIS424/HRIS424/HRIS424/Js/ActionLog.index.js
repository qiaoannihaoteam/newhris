/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Purpose      : ActionLog index

Date         : 16 Feb 2017
Author       : KT Chen (ISD/CSC)
Note         : 
-------------------------------------------------
16 Feb 2017      KT Chen (ISD/CSC)        the first version

the latest update: 16 Feb 2017 18:36
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

$(function () {
    //初始化语言
    LangInit();

    if (ShowType && Table && FunctionID) {
        IndexPager.init();
    }
});

// 提供页面上的基本功能
var IndexPager = {
    grid: null,

    dateFrom: $("#dateFrom").kendoDatePicker({
        format: "dd MMM yyyy",
        parseFormats: ["yyyy-MM-dd"],
        max: new Date(),
        value: new Date()
    }).data("kendoDatePicker"),

    dateEnd: $("#dateEnd").kendoDatePicker({
        format: "dd MMM yyyy",
        parseFormats: ["yyyy-MM-dd"],
        max: new Date(),
        value: new Date()
    }).data("kendoDatePicker"),
    // 获取页面的URL
    pageUrl: 'View/ActionLog.aspx?',
    // 获取页面对应的API的URL
    apiUrl: '../View/Api/ActionLogApi.ashx?',
    init: function () {
        $.showCover();
        IndexPager.grid =
            $("#grid").kendoGrid({
                columns: ["RID"],
                //                filterable: {
                //                    mode: "row"
                //                },
                dataSource: [],
                sortable: true,
                pageable: {
                    pageSize: 25,
                    pageSizes: [10, 15, 25, "all"]
                }
            }).data("kendoGrid");

        $(window).on("resize", function () {
            IndexPager.grid.resize();
        });

        $("#btnRefresh").on("click", IndexPager.GridRead);

        $("#btnExportExcel").on("click", IndexPager.exportExcel);

        $("#btnExit").on("click", function () { parent.navTab.closeCurrentTab(); });

        $(".toolBar > li").addHoverClass();



        IndexPager.dateFrom.max(IndexPager.dateEnd.value());
        IndexPager.dateEnd.min(IndexPager.dateFrom.value());

        $("#dateFrom").change(function () {
            var datepicker = $("#dateFrom").data("kendoDatePicker");
            var value = new Date(this.value);
            datepicker.value(value);
            IndexPager.startChange();
        });
        $("#dateEnd").change(function () {
            var datepicker = $("#dateEnd").data("kendoDatePicker");
            var value = new Date(this.value);
            datepicker.value(value);
            IndexPager.endChange();
        });

        //Budget单选按钮
        $("input[type=radio][name=ShowType]").on("change", function () {
            console.log("on");
            ShowType = this.id;
            IndexPager.GridRead();
        });



        if (ShowType == "all") {
            $("#all").trigger('click');
            document.getElementById("ShowTypeRadio").style.display = "none";
            //document.getElementById('grid').style.top = '30px';
            document.getElementById("logDate").style.marginLeft = "10px";
        } else {
            $("#current").trigger('click');
        }
    },

    // 导出Excel
    exportExcel: function () {
        $('#grid').data("kendoGrid").saveAsExcel();
    },


    GridRead: function () {
        var url = IndexPager.apiUrl + "action=Search";
        $.showCover();
        $.ajax({ url: url, dataType: "json", type: "post", data: { FunctionID: FunctionID, RID: RID, Table: Table, ShowType: ShowType} })
            .done(function (result) {
                if (!result.IsSuccess)
                    return;
                if (!result.Data.columns)
                    return;
                IndexPager.grid.setOptions({
                    columns: result.Data.columns,
                    dataSource: {
                        schema: result.Data.schema,
                        data: result.Data.Data
                    }
                });
                IndexPager.GridFilter();
            }).always($.hideCover);
    },

    GridFilter: function () {
        var from = $("#dateFrom").data("kendoDatePicker").value();
        var to = $("#dateEnd").data("kendoDatePicker").value();
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        var filter = {
            logic: "and",
            filters: [
            { field: "ACTION_DATE", operator: "gte", value: from },
            { field: "ACTION_DATE", operator: "lte", value: to }
            ]
        };
        IndexPager.grid.dataSource.filter(filter);
    },

    startChange: function () {
        var startDate = IndexPager.dateFrom.value(),
            endDate = IndexPager.dateEnd.value();

        if (startDate) {
            startDate = new Date(startDate);
            startDate.setDate(startDate.getDate());
            IndexPager.dateEnd.min(startDate);
        } else if (endDate) {
            IndexPager.dateFrom.max(new Date(endDate));
        } else {
            endDate = new Date();
            IndexPager.dateFrom.max(endDate);
            IndexPager.dateEnd.min(endDate);
        }
        IndexPager.GridFilter();
    },

    endChange: function () {
        var endDate = IndexPager.dateEnd.value(),
                        startDate = IndexPager.dateFrom.value();

        if (endDate) {
            endDate = new Date(endDate);
            endDate.setDate(endDate.getDate());
            IndexPager.dateFrom.max(endDate);
        } else if (startDate) {
            IndexPager.dateEnd.min(new Date(startDate));
        } else {
            endDate = new Date();
            IndexPager.dateFrom.max(endDate);
            IndexPager.dateEnd.min(endDate);
        }
        IndexPager.GridFilter();
    }
}