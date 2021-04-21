document.addEventListener("turbolinks:load", function () {
  var append_input = $(
    '<li class="input">'+
      '<label class="upload-label">'+
        '<div class="upload-label__text">'+
          '<p>ドラッグアンドドロップ</p>'+
          '<p>またはクリックしてファイルをアップロード</p>'+
          '<div class="input-area">'+
            '<input class="hidden image_upload" type="file">'+
          '</div>'+
        '</div>'+
      '</label>'+
    '</li>'
  );  
  $ul = $('#previews')
  $lis = $ul.find('.image-preview');
  $inputs = $ul.find(".image_upload")
  console.log('jqueryを読み込んだ');
  if ($lis.length <= 9 && $('.input').length <= 0){
    console.log('条件分読み込んだ！');
    $ul.append(append_input);    
  }
});

$(document).on("click", ".image_upload", function(){
  var preview = $(
    '<div class="image-preview__wapper">'+
      '<img class="preview">'+
    '</div>'+
    '<div class="image-preview_btn">'+
      '<div class="image-preview_btn_edit">編集</div>'+
      '<div class="image-preview_btn_delete">削除</div>'+
    '</div>'
  );
  var append_input = $(
    '<li class="input">'+
      '<label class="upload-label">'+
        '<div class="upload-label__text">'+
          '<p>ドラッグアンドドロップ</p>'+
          '<p>またはクリックしてファイルをアップロード</p>'+
          '<div class="input-area">'+
            '<input class="hidden image_upload" type="file">'+
          '</div>'+
        '</div>'+
      '</label>'+
    '</li>'
  );
  $ul = $('#previews')
  $li = $(this).parents('li')
  $label = $(this).parents('.upload-label')
  $inputs = $ul.find(".image_upload")
  
  $(".image_upload").on('change', function(e){
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function(e){
      $(preview).find(".preview").attr("src", e.target.result);
      $(preview).find(".preview").css('width','100%');
    };
    
    $li.append(preview);
  
    $label.css('display', 'none');
    $li.removeClass('input');
    $li.addClass('image-preview');
    $lis = $ul.find('.image-preview');
    //ここまでは､もともと表示されているinputタグに対してclassを取ったり付けたりしている｡

    // $lisの.image-previewは$li.addClass('image-preview')をもとにfindしてる
    $('#previews li').css({
      width:'20%',
    });
    // inputタグの部分のwidthを動的に変える処理
    if ($lis.length <= 4){
      // debugger
      $ul.append(append_input);
      $('#previews li:last-child').css({
        width:`calc(100% - (20% * ${$lis.length}))`,
      });
    }else if ($lis.length == 5){
      // $li.addClass("image-preview"); // ←これは5番目以降からli label input の li に対して､クラスを付けている｡なんで？
      $ul.append(append_input);
      $('#previews li:last-child').css({
        width:'100%',
      });
    }else if ($lis.length <= 9){
      // $li.addClass("image-preview");
      $ul.append(append_input);
      $('#previews li:last-child').css({
        width:`calc(100% - (20% * (${$lis.length} - 5)))`,
      });      
    }

    $inputs.each(function(index, input){
      $(input).removeAttr("name");
      $(input).attr({
        name: `item[images_attributes][${index}][img]`,
        id: `item_images_attributes_${index}_img`,
      });
    });
    
  });
});