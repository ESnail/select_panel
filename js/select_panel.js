// 筛选条件 begin
// 最终数据：searchMod.searchData
var searchMod = (function () {
    var searchMod = {
        url: {
            getListData: '/managereport/adgroupreport'
        },
        data: {
            btnData: [ // children:子级往下，直至底级子级  parent:父级往上，直至顶级父级
                [
                    {key: 'source', title: '交易市场'},
                    {key: 'advertiser', title: '广告主', children: 'campaign, adgroup, creative'},
                    {key: 'campaign', title: '推广计划', parent: 'advertiser', children: 'adgroup, creative'},
                    {key: 'adgroup', title: '广告', parent: 'campaign, advertiser', children: 'creative'},
                    {key: 'creative', title: '创意', parent: 'adgroup, campaign, advertiser'}
                ],
                [
                    {key: 'media', title: '媒体'},
                    {key: 'adunit', title: '广告位'},
                    {key: 'size', title: '尺寸'},
                    {key: 'ad_type', title: '广告形式'},
                ]
            ],
            checkedData: {},
            checkedParentData: {}
        },
        event: function () {
            $('body').on('click', '#search .dropdown-menu', function (e) { // 阻止弹层向上冒泡
                e.stopPropagation();
            }).on('click', '#search .btn-click', function () { // 按钮点击展开
                searchMod.renderTabContent('all', $(this).closest('.btn-group'));
            }).on('click', '#search .nav-tabs li', function () { // tab切换
                var $this = $(this),
                    $curBtn = $this.closest('.btn-group');
                $this.addClass('active').siblings().removeClass('active');
                var tab = $this.attr('tab'),
                    $input = $curBtn.find('.input-wrap'),
                    $pannelHead = $curBtn.find('.pannel-head'),
                    $pnnelLabel = $pannelHead.find('>label'),
                    $pannelClear = $pannelHead.find('.clear');
                $curBtn.find('.search-input').val('').blur();
                if (tab == 'all') {
                    $input.show();
                    $pnnelLabel.show();
                    $pannelClear.hide();
                    $curBtn.find('li').show();
                } else {
                    $input.hide();
                    $pnnelLabel.hide();
                    $pannelClear.show();
                    $curBtn.find('.check-item:not(:checked)').closest('li').hide();
                }
                $pannelHead.attr('class', 'pannel-head ' + tab);
            }).on('click', '#search .check-item', function () { // checkbox单选
                var $this = $(this),
                    $curBtn = $this.closest('.btn-group'),
                    curTab = $curBtn.find('.nav-tabs li.active').attr('tab'),
                    $checkedAll = $curBtn.find('.check-all'),
                    total = $curBtn.find('.text-info').text(),
                    checkedNum = $curBtn.find('.check-item:checked').length || 0;
                $checkedAll.prop("checked", checkedNum == total);
                $curBtn.find('span.selected-num').html(checkedNum);
                
                if (curTab == 'selected') {
                    !$this.is(':checked') && $this.closest('li').hide();
                }
            }).on('click', '#search .check-all', function () { // checkbox全选
                var $this = $(this),
                    $curBtn = $this.closest('.btn-group');
                $curBtn.find('.check-item:visible').prop("checked", $this.prop("checked"));
                $curBtn.find('span.selected-num').html($curBtn.find('.check-item:checked').length || 0);
            }).on('click', '#search .clear', function () { // 清空已选择
                var $curBtn = $(this).closest('.btn-group');
                $curBtn.find('.check-all').prop('checked', false);
                $curBtn.find('.check-item').prop('checked', false).closest('li').hide();
                $curBtn.find('span.selected-num').html(0);
            }).on('keyup blur', '#search .search-input', function () { // 搜索输入
                var $this = $(this),
                    $curBtn = $this.closest('.btn-group'),
                    keywords = $.trim($this.val()).toUpperCase(),
                    $checkItem = $curBtn.find('.pannel-body ul li');
                if (keywords) {
                    $checkItem.hide();
                    $checkItem.each(function (index, el) {
                        var $el = $(el),
                            name = $el.find('span.ell').attr('title').toUpperCase();
                        if(name.indexOf(keywords) !== -1) {
                            $el.show();
                        }
                    })
                } else {
                    $checkItem.show();
                }
                var visibleNum = $curBtn.find('.check-item:visible').length,
                    checkedVisibleNum = $curBtn.find('.check-item:visible:checked').length,
                    checked = visibleNum === checkedVisibleNum && visibleNum != 0;
                $curBtn.find('.total').html($curBtn.find('.check-item:visible').length);
                $curBtn.find('.check-all').prop('checked', checked);
            }).on('click', '#search .search-btn', function () { // 搜索按钮
                $('#search .search-input').blur();
            }).on('click', '#search .cancel', function () { // 取消
                $(this).closest('.btn-group').removeClass('open');
            }).on('click', '#search .confirm', function () { // 确定
                var $curBtn = $(this).closest('.btn-group'),
                    $checkedItem = $curBtn.find('.check-item:checked'),
                    checkedArr = [],
                    checkedParentArr = [];
                $curBtn.removeClass('open');
                $checkedItem.each(function (index, el) {
                    checkedArr.push(el.value);
                    checkedParentArr.push($(el).attr('parent'));
                });
                checkedParentArr = Array.from(new Set(checkedParentArr));
                searchMod.checkeCallback($curBtn, checkedArr, checkedParentArr);
            });
        },
        init: function () {
            searchMod.renderBtn();
            searchMod.event();
        },
        // 渲染按钮
        renderBtn: function () {
            var tp = $('#tp_search_btn'),
                data = searchMod.data.btnData;
            $('#search .item.red').html(tp.render({data:data[0], color: 'primary'}));
            $('#search .item.blue').html(tp.render({data:data[1], color: 'info'}));
        },
        // 渲染tab全部的数据
        renderTabContent: function (tab, $curBtn) {
            $curBtn.find('.nav-tabs li[tab="all"]').click();

            // 遍历找到真正的父级，若上一级没有选中的数据，就找上上一级
            var key = $curBtn.attr('key'),
                parentArr = $curBtn.attr('parent') ? $curBtn.attr('parent').split(',') || [] : [],
                parent = '';
            for (var i=0; i < parentArr.length; i++) {
                var item = $.trim(parentArr[i]),
                    arr = searchMod.data.checkedData[item] || [];
                if (arr.length) {
                    parent = item;
                    break;
                }
            }
            var parentData = searchMod.data.checkedData[parent] || [],
                params = {
                    'action': 'select',
                    'type': key,
                    'parent_type': parent,
                    'parent_selected_ids': parentData
                },
                $pannelBody = $curBtn.find('.pannel-body'),
                pannelLiLen = $pannelBody.find('li').length;
            // sessionStorage记录上一次的请求参数，若相同就不再请求，较少请求
            var oldQuery = sessionStorage.getItem(key),
                newQuery = JSON.stringify(params);
            if (oldQuery == newQuery && pannelLiLen) {
                searchMod.initCheckedData($curBtn, key, parent, pannelLiLen);
                return ;
            }
            sessionStorage.setItem(key, newQuery);
            
            // 模拟处理
            $pannelBody.html(' <div id="loading" class="loading"><img src="img/loading.gif"></div>');
            setTimeout(function () {
                var data = result[params.type] || [],
                    $curBtn = $('#search .btn-group[key="'+key+'"]'),
                    total = data.length,
                    parentArr = params.parent_selected_ids || [];
                if (params.parent_type && parentArr.length) {
                    data.find(function (item) {
                        parentArr.forEach(function (p) {
                            if (item.parent_id == p) {
                                return item;
                            }
                        })
                    })
                }
                $curBtn.find('.pannel-body').html($('#tp_tab_content').render({data:data}));
                $curBtn.find('.total').html(total);
                searchMod.initCheckedData($curBtn, key, parent, total);
            }, 1000)

            // 实际请求
            // $.ajax({
            //     type: 'post',
            //     url: searchMod.url.getListData,
            //     data: params,
            //     dataType: 'json',
            //     beforeSend: function () {
            //         $pannelBody.html(' <div id="loading" class="loading"><img src="/img/widgets/loading.gif"></div>');
            //     },
            //     success: function (result) {
            //         var data = result.ret_msg ? result.ret_msg.records || [] : [],
            //             $curBtn = $('#search .btn-group[key="'+key+'"]'),
            //             total = data.length;
            //         $curBtn.find('.pannel-body').html($('#tp_tab_content').render({data:data}));
            //         $curBtn.find('.total').html(total);
            //         searchMod.initCheckedData($curBtn, key, parent, total);
            //     },
            //     error: function () {
            //         console.log('获取数据错误');
            //     }
            // });
        },
        // 信息回填 
        initCheckedData: function ($curBtn, curKey, parent, total) {                    
            var checkedArr = searchMod.data.checkedData[curKey] || [];
            // 当前有选中，回填当前数据
            if (checkedArr.length) {
                // 默认不选中
                $curBtn.find('.check-all, .check-item').prop('checked', false);
                checkedArr.map(function (id) {
                    $curBtn.find('.check-item[value="'+ id +'"]').prop('checked', true);
                })
                $curBtn.find('.selected-num').text($curBtn.find('.check-item:checked').length);
                if (checkedArr.length == total) {
                    $curBtn.find('.check-all').prop('checked', true);
                }
            } else {
                // 父级选中，子级全选
                var parentCheckedArr = searchMod.data.checkedData[parent] || [];
                if (parentCheckedArr.length) {
                    $curBtn.find('.check-all, .check-item').prop('checked', true);
                    $curBtn.find('.selected-num').text(total);
                } else { // 父级未选,子级不选
                    $curBtn.find('.check-all, .check-item').prop('checked', false);
                    $curBtn.find('.selected-num').text(0);
                }
            }
            setTimeout(function () {
                $curBtn.find('.search-input').val('').blur(); 
            }, 0)
        },
        // 选择数据保存后的回调
        checkeCallback: function ($curBtn, checkedArr, checkedParentArr) {
            // 按钮数据变化
            var $curBtnCheckedNum = $curBtn.find('.btn-selected-num');
            checkedArr.length ? $curBtnCheckedNum.text('(' + checkedArr.length + ')').show() : $curBtnCheckedNum.hide();
            var childrenArr = $curBtn.attr('children') ? $curBtn.attr('children').split(',') : [];
            childrenArr.map(function (key) {
                key = $.trim(key);
                $('#search .btn-group[key="'+key+'"]').find('.btn-selected-num').html('('+0+')').hide();
                searchMod.data.checkedData[key] = [];
                searchMod.data.checkedParentData[key] = [];
            });
            // 保存记录数据
            var curKey = $curBtn.attr('key');
            searchMod.data.checkedData[curKey] = checkedArr;
            searchMod.data.checkedParentData[curKey] = checkedParentArr;
        },
        getSearchData: function () {
            return searchMod.data.checkedData || {};
        }
    };
    searchMod.init()

    return {searchData: searchMod.getSearchData()}
})();
// 筛选条件 end