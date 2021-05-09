
document.addEventListener("turbolinks:load", function() {
  // category-select__boxの<option>を作成
  function appendOption(category){
    var html = `<option value="${category.id}" data-category="${category.id}">${category.name}</option>`;
    return html;
  }
  // 子カテゴリーの表示作成と追加､でも引数の insertHTML を作成してから使う
  function appendChidrenBox(insertHTML){
    var childSelectHtml = '';
    childSelectHtml = `<div class='child-category__wrapper'>
                        <select class="child-select-box" id="child_category" name="item[category_id]">
                          <option value="---" data-category="---">---</option>
                          ${insertHTML}
                        <select>
                        <i class='fas fa-chevron-down'></i>
                      </div>`;
    $('.parent-category__wrapper').append(childSelectHtml);
  }
  // 孫カテゴリーの表示作成と追加､でも引数の insertHTML を作成してから使う
  function appendGrandchidrenBox(insertHTML){
    var grandchildSelectHtml = '';
    grandchildSelectHtml = `<div class='grandchild-category__wrapper'>
                              <select class="grandchild-select-box" id="grandchild_category" name="item[category_id]">
                                <option value="---" data-category="---">---</option>
                                ${insertHTML}
                              <select>
                              <i class='fas fa-chevron-down'></i>
                            </div>`;
    $('.parent-category__wrapper').append(grandchildSelectHtml);
  }
  // 親カテゴリー選択後のイベント
  $('#parent_category').on('change', function(){
    var parentCategory = $('#parent_category').val(); //選択された親カテゴリーの名前を取得
    // var parentCategory = document.getElementById('parent_category').value; //選択された親カテゴリーの名前を取得
    if (parentCategory != '---'){ //親カテゴリーが初期値でないことを確認
      $.ajax({
        url: '/items/get_category_children',
        type: 'GET',
        data: { parent_id: parentCategory },
        dataType: 'json'
      })
      // json.jbuilderで処理した値がjsに返ってきて､それを".done(function(引数))"の引数で扱えるということ？
      .done(function(children){
        $('#children_wrapper').remove(); //親が変更された時、子以下を削除する｡（これは､一度カテゴリを選択し直したときに必要）
        $('#grandchildren_wrapper').remove();
        var insertHTML = '';
        children.forEach(function(child){  // ←ここの引数のchildrenは多分､ajax通信をしたあとに返ってくる値
          insertHTML += appendOption(child);
        });
        appendChidrenBox(insertHTML);
      })
      .fail(function(){
        alert('カテゴリー取得に失敗しました');
      })
    }else{
      $('#children_wrapper').remove(); //親カテゴリーが初期値になった時、子以下を削除する
      $('#grandchildren_wrapper').remove();
    }
  });
  // 子カテゴリー選択後のイベント
  $('.parent-category__wrapper').on('change', '#child_category', function(){
    var childId = $('#child_category option:selected').data('category'); //選択された子カテゴリーのidを取得
    // debugger
    if (childId != '---'){ //子カテゴリーが初期値でないことを確認
      $.ajax({
        url: '/items/get_category_grandchildren',
        type: 'GET',
        data: { child_id: childId },
        dataType: 'json'
      })
      .done(function(grandchildren){
        if (grandchildren.length != 0) {
          $('#grandchildren_wrapper').remove(); //子が変更された時、孫以下を削除するする
          var insertHTML = '';
          grandchildren.forEach(function(grandchild){
            insertHTML += appendOption(grandchild);
          });
          appendGrandchidrenBox(insertHTML);
        }
      })
      .fail(function(){
        alert('カテゴリー取得に失敗しました');
      })
    }else{
      $('#grandchildren_wrapper').remove(); //子カテゴリーが初期値になった時、孫以下を削除する
    }
  });
  // カテゴリは孫カテゴリのみ保存されるように､親・子は送信する直前で削除
  $('.submit-btn').on('click',function(){
    console.log('ボタンが押されました')
    var selectBox = $('select[name="item[category_id]"]')
    if (selectBox.length < 3){
      $('#child_category').remove();
      // $('#parent_category').val('');
      console.log('カテゴリ不足');
    }else{
      $('#child_category').remove();
      $('#parent_category').remove();
      console.log('正常');
    }
    debugger
  });
});