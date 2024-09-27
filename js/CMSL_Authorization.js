var CMSL_coverEnabled = false;
var CMSL_alertResult = false;


$(function(){
	CMSL.Authorize.initCover();
	if(getAllUrlParams().showpopup != undefined){
		$.get("/httpr/GetSysMessage.php",function(text){
			//if(text != 'fail'){
				CMSL_alert(text);
			//}
		});
	}
});

if(!CMSL){ var CMSL = {}; }
CMSL.Authorize = function()  {

	var testingSize;
	var fadeSpeed = 555;
	
	function trim(str) {
		while(str.charAt(str.length-1)==' ') str=str.slice(0, str.length-1);
		while(str.charAt(0)==' ') str=str.slice(1);
		return str;
	}
	function loadSuccessAuthorize() {
		// SEE IT 
		window.location.replace('/index.php?showpopup=1');
		/*$.get("/mod/httpr/SuccessAuthorize.php", {}, function(xml) {
				err = $(xml).find('error').text();
				if(err != 'success'){ 
					alert(err); 
				} else {
					$('#CMSL_reloadContainer').html($(xml).find('text').text());
					$('#loginContainer').html('<div id="CMSL_logout"><a class="CMSL_logout" onclick="CMSL.Authorize.logout()">Выход</a></div>'); // SEE IT!!!
				}
		});*/
	}
	function authorization() {
		var email = $('#CMSL_login').val();
		var pass = $('#CMSL_pass').val();
		$.get("/mod/httpr/Authorization.php", {email:email,pass:pass}, function(xml) {
				err = $(xml).find('error').text();
				if(err != 'success'){ 
					if(err == 'notauthorized') {
						CMSL_alert('Для завершения регистрации, введите код верификации, высланный на указанный Вами e-mail адрес.');
						$('#CMSL_reloadContainer').html($(xml).find('text').text());
						// initButtons('#CMSL_reloadContainer');
					} else {
						CMSL_alert(err); 
					}
				} else {
					loadSuccessAuthorize();
				}
		});
	}
	// Функция на случай, если неавторизованный пользователь заходит
	// на страницу, где ему быть нельзя. Тогда ему показывается окно авторизации,
	// после чего он вводит данные и страница перезагружается.
	function loginAndRedirect() {
		var email = $('#CMSL_login').val();
		var pass = $('#CMSL_pass').val();
		$.get("/mod/httpr/Authorization.php", {email:email,pass:pass}, function(xml) {
				err = $(xml).find('error').text();
				if(err != 'success'){ 
					if(err == 'notauthorized') {
						CMSL_alert('Для завершения регистрации, перейдите по ссылке, указанной в письме!');					
					} else {
						CMSL_alert(err); 
					}
				} else {
					// Авторизовались, и переходим на ту страницу, где и были,
					// только теперь уже авторизованные.
					location.replace(location);
				}
		});
	}
	function showRegistration() {
		$.get("/mod/httpr/ShowRegistration.php", {}, function(text) {
					$('#CMSL_reloadContainer').html(text);
					// initButtons('#CMSL_reloadContainer');
					// $('#s_tel').mask('(999) 999-9999');
		});	
	}
	function changePassword() {
		$.get("/mod/private/ChangePassword.php", {}, function(text) {
					$('#CMSL_reloadContainer').html(text);
					// initButtons('#CMSL_reloadContainer');
		});	
	}
	function registration(usergroup) {
		var form = document.forms['registrationForm'];
		
		if(usergroup != -1){
			// SEE IT Тут может быть соглашение с договором-офертой
		} else {
			usergroup = $('#ugroup').val();
		}
		
		$("#registrationForm .CMSL_valueNeeded").removeClass('CMSL_valueNeeded');
		
		var errors = 0;
		$("#registrationForm .req").each(function (i) {
							if( ! $(this).hasClass('selectArea') ) { // SEE IT. For forms (select replace)
								if ( trim( $(this).val() ) == '' ) {
									$(this).parent().parent().addClass('CMSL_valueNeeded');
									errors++;
								}
							}
					});
					
		if(errors) {
			// SEE IT (LANG and OTHER)
			CMSL_alert('Не заполнены обязательные поля в кол-ве: '+errors);
			return;
		}
	
		var param = $('#registrationForm').serialize();
		param = param + '&usergroup=' + usergroup;
		$.get("/mod/httpr/Registration.php", param, function(xml) {
					err = $(xml).find('error').text();
					if(err != 'success'){ 
						CMSL_alert(err); 
					} else {
						$('#CMSL_reloadContainer').slideUp(fadeSpeed,function(){
							$('#CMSL_reloadContainer').html($(xml).find('text').text());
							// initButtons('#CMSL_reloadContainer');
							$('#CMSL_reloadContainer').slideDown(fadeSpeed,function(){
								$('#s_tel').mask('+7 (999) 999-9999');
							});
						});
					}
		});	
	}
	// Тут имеется в виду, что formname == id формы !!! 
	// Функция анализирует заполненность обязательных полей
	// и отправляет форму, полученную из прикреплённой (обязательно)
	// к пользовательской группе таблице, которая выводится через функцию
	// showTableForm(); 
	function submitUserForm(usergroup,formname,jumpURL) {
		var form = document.forms[formname];
		
		$('#'+formname+' .CMSL_valueNeeded').removeClass('CMSL_valueNeeded');
		
		var errors = 0;
		$('#'+formname+' .req').each(function (i) {
									if ( trim( $(this).val() ) == '' ) {
										$(this).parent().parent().addClass('CMSL_valueNeeded');
										errors++;
									}
								});
					
		if(errors) {
			// SEE IT (LANG and OTHER)
			CMSL_alert('Не заполнены обязательные поля в кол-ве: '+errors);
			return;
		}
	
		var param = $('#'+formname).serialize();
		param = param + '&usergroup=' + usergroup;
		$.get("/httpr/SubmitUserForm.php", param, function(xml) { // /mod/httpr/Registration.php
			err = $(xml).find('error').text();
			if(err != 'success'){ 
				CMSL_alert(err); 
			} else {
				$('#'+formname).slideUp('fast',function(){
					var scrollpos = $('#scrollAnchor').offset().top;
					$("body,html").animate({scrollTop:scrollpos},'fast'); // SEE IT.Задокументировать scrollAnchor
				});
			}
		});	
	}
	function verification() {
		var code = $('#s_verification').val();
		var param = $('#verificationForm').serialize();
		$.get("/mod/httpr/Verification.php", param, function(xml) {
				err = $(xml).find('error').text();
				if(err != 'success'){ 
					CMSL_alert(err); 
				} else {
					window.location.replace('/index.php?showpopup=1');
				}
		});
	}
	function comparePass(id1,id2) {
		if(testingSize) return;
		if($('#'+id1).val() != $('#'+id2).val()) {
			CMSL_alert("Пароли не совпадают!");
			$('#'+id1).val('');
			$('#'+id2).val('');
			$('#'+id1).focus();
		}
	}
	function testPsize(id) {
		testingSize = true;
		var obj = $('#'+id);
		if(obj.val().length < 6) {
			// SEE IT (LANG and OTHER)
			CMSL_alert("Пароль должен содержать не менее шести символов!");
			obj.focus();
		} else {
			testingSize = false;
		}
	}
	function isValidEmail(email, strict){
		if ( !strict ) email = email.replace(/^\s+|\s+$/g, '');
		 return (/^([a-z0-9_\-]+\.)*[a-z0-9_\-]+@([a-z0-9][a-z0-9\-]*[a-z0-9]\.)+[a-z]{2,4}$/i).test(email);
	}
	function testEmail(id) {
		var obj = $('#'+id);
		if(!isValidEmail(obj.val())) {
			// SEE IT (LANG and OTHER)
			CMSL_alert("Неправильный e-mail адрес!");
			// obj.focus(); (не даёт ничего делать)
		}
	}
	function restorePassword(id) {
		var email = trim($('#'+id).val());
		if(email=='') {
			// SEE IT (LANG and OTHER)
			CMSL_alert('Для восстановления пароля, введите в эту форму e-mail, который Вы использовали при регистрации и нажмите кнопку "Забыли пароль?" ещё раз.');
		} else {
			$.get("/mod/httpr/SendVerification.php", {email:email}, function(xml) {
						err = $(xml).find('error').text();
						if(err != 'success'){ 
							CMSL_alert(err); 
						} else {
							CMSL_alert($(xml).find('text').text(),hideCover);
						}
					});
		}
	}
	function submitChangePasswordForm(){
		var pass = $('#CMSL_pass').val();
		var code = $('#CMSL_CompareCode').val();
		$.post("/httpr/RestorePassword.php",{pass:pass,code:code},function(xml){
			var info = $('info',xml).text();
			var status = $('status',xml).text();
			CMSL_alert(info,hideCover);
			if(status == 'success'){
				$('#CMSL_pass').val('');
				$('#CMSL_CompareCode').val('');
			}
		});
	}
	function logout() {
		$.get("/mod/httpr/Logout.php", {}, function(xml){window.location.replace('/');}); // See it! Нужно просто поменять ключик в хедере. P.S. или не просто).
	}
	function deleteComment(id) {
		CMSL_confirm("Вы действительно хотите удалить этот комментарий?", function() {
			$.getJSON("/httpr/DeleteComment.php", {id:id}, function(data) {
						if(data.error=='1'){ 
							CMSL_alert(data.message); 
						} else {
							// refreshComments(); SEE IT - долго, муторно и неочевидно.
							// в прошлый раз решалось передачей параметров, которые брались из 
							// функции отображения и через шаблон передавались в функцию удаления.
							// Использовался только patentid, сейчас есть ещё parentkind и tplid.
							// P.S. решено посредством запоминания предыдущих значений.
							refreshComments();
						}
					});
		});
	}
	function refreshComments(){
		$.post("/httpr/RefreshComments.php", function(xml) {
			html = $('TEXT',xml).text();
			count = $('COUNT',xml).text();
			$("#CMSL_commentsContainer").html(html);
			if($('#comCount').length){
				$('#comCount').html(count);
			}
		});
	}
	function loadRegForm(name,tid,groupid,fparam){
		$('#formContainer').slideUp('fast',function(){
			$.post('/mod/httpr/LoadRegForm.php', {name:name,tid:tid,groupid:groupid,fparam:fparam}, function(text) {
				$('#formContainer').html(text);
				// initButtons('#formContainer');
				$('#formContainer').slideDown('fast',function(){ 
					//**** SEE IT - выбор стран и регионов в Гинекологах
					// Выбор региона / города при регистрации
					if($('#COUNTRY').length){
						$('#COUNTRY').change(function(){
							// Выбор региона
							if($('#COUNTRY').val()=='1'){
								$.get('/httpr/SelectRegions.php',function(html){
									$('#REGION').html(html);
								});
							} else {
								$('#REGION').html('<option value="-1">Нет регионов</option>');
							}
						});
						$('#REGION').change(function(){
							// Выбор городов
							if($('#REGION').val()!='-1'){
								var rid = $('#REGION').val();
								$.get('/httpr/SelectTowns.php',{region:rid},function(html){
									$('#TOWN').html(html);
								});
							} else {
								$('#TOWN').html('<option value="-1">Нет городов</option>');
							}
						});
					}		
					// END OF SEE IT - выбор стран и регионов в Гинекологах
				});
			});
		});
	}
	function loadAdmRegForm(module,name,tid,groupid,fparam) {
		$('#formContainer').slideUp('fast',function(){
				$.post('/mod/httpr/'+module, {name:name,tid:tid,groupid:groupid,fparam:fparam}, function(text) {
					$('#formContainer').html(text);
					$('#formContainer').slideDown('fast',function(){ /* setMasks();  initCustomForms(); SEE IT */ });
				});
		});
	}
	function initCover(){
		if(! $('#CMSL_reloadContainer').length){
			$('body').prepend('<div id="CMSL_cover"><div id="CMSL_space"></div><div id="CMSL_coverCloseBtn"></div><div id="CMSL_coverInner"><div id="CMSL_reloadContainer"></div></div></div>');
			$('#CMSL_coverCloseBtn').click(function(){hideCover();});
			CMSL_coverEnabled = true;
		}
	}
	function showCover(mode,callback) {
		if(mode){
			$('#CMSL_coverInner').css('display','none');
			$('#CMSL_space').css('display','block');
		} else {
			$('#CMSL_coverInner').css('display','block');
			$('#CMSL_space').css('display','none');
		}
		freezeBody(2);
		$('#CMSL_cover').fadeIn(fadeSpeed,function(){ 
			if(callback)callback();
		});
	}
	function hideCover(callback) {
		$('#CMSL_cover').fadeOut(fadeSpeed,function(){ 
			unfreezeBody(2);
			$('#CMSL_reloadContainer').empty();
			$('#CMSL_space').empty();
			if(callback)callback();
		});
	}
	function login(){
		var email = (arguments.length < 1) ? null : arguments[0];
		$.get('/httpr/Login.php',{},function(text){
			$('#CMSL_reloadContainer').html(text);
			// initButtons('#CMSL_reloadContainer');
			if(email){
				$('#CMSL_login').val(email);
			}
			if(CMSL_coverEnabled){
				showCover(0,null);
			}
		});
	}
	function sendActivation(userid){
		$.post('/mod/httpr/SendActivation.php',{userid:userid},function(text){
			CMSL_alert(text);
		});
	}
	function closeInlineMsg(child){
		$(child).parent().slideUp('fast',function(){
			$(this).detach();
		});
	}

	return {
		loginAndRedirect: loginAndRedirect,
		authorization: authorization,
		submitChangePasswordForm: submitChangePasswordForm,
		showRegistration: showRegistration,
		changePassword: changePassword,
		registration: registration,
		verification: verification,
		comparePass: comparePass,
		testPsize: testPsize,
		testEmail: testEmail,
		restorePassword: restorePassword,
		refreshComments: refreshComments,
		submitUserForm: submitUserForm,
		deleteComment: deleteComment,
		loadRegForm: loadRegForm,
		loadAdmRegForm: loadAdmRegForm,
		login: login,
		logout: logout,
		initCover: initCover,
		showCover: showCover,
		hideCover: hideCover,
		sendActivation: sendActivation,
		closeInlineMsg: closeInlineMsg
	}
}();

function CMSL_alert(message){
	
	var callback = (arguments.length < 2) ? null : arguments[1];
	var butname = (arguments.length < 3) ? C_CLOSE_BTN : arguments[2]; // SEE IT!
	
	if(!$('#CMSL_messageCover').length) {
		$('body').append('<div id="CMSL_messageCover"></div>');
	}

	$('#CMSL_messageCover').html('<div id="CMSL_alertOuter"><div id="CMSL_alertInner"><div id="CMSL_alertContainer"><div class="CMSL_windowCaption">'+C_SITE_MESSAGE+'</div><div id="CMSL_alertCloseIcon"></div><div id="CMSL_alertMessage"></div><div class="CMSL_buttonContainer"><a class="button b-bulk p-brown" id="CMSL_alertCloseBtn">'+butname+'</a></div></div>');
	// initButtons('#CMSL_messageCover');

	$('#CMSL_alertCloseBtn').click(function(){
		CMSL_alertStatus = true;
		$('#CMSL_messageCover').fadeOut(200, callback);
		unfreezeBody(1);
	});
	
	$('#CMSL_alertCloseIcon').click(function(){
		CMSL_alertStatus = false;
		$('#CMSL_messageCover').fadeOut(200, callback);
		unfreezeBody(1);
	});
	
	$('#CMSL_alertMessage').html(message); 
	
	freezeBody(1);
	
	$('#CMSL_messageCover').fadeIn(100,function() {
		$('#CMSL_alertContainer').fadeIn(200);
	});
}

function CMSL_confirm(message) {
	var callback = (arguments.length < 2) ? null : arguments[1];
	var yesbtn = (arguments.length < 3) ? 'ДА' : arguments[2]; // SEE IT (LANGUAGE)!
	var nobtn = (arguments.length < 4) ? 'НЕТ' : arguments[3]; // SEE IT!
	
	if(!$('#CMSL_messageCover').length) {
		$('body').append('<div id="CMSL_messageCover"></div>');
	}
	$('#CMSL_messageCover').html('<div id="CMSL_alertOuter"><div id="CMSL_alertInner"><div id="CMSL_alertContainer"><div class="CMSL_windowCaption">Сообщение с сайта</div><div id="CMSL_alertCloseIcon"></div><div id="CMSL_alertMessage"></div><div class="CMSL_buttonContainer"><a class="button b-bulk p-green" id="CMSL_confirmYesBtn">'+yesbtn+'</a><a class="button b-bulk p-red" id="CMSL_confirmNoBtn">'+nobtn+'</a></div></div>');
	// initButtons('#CMSL_messageCover');
	$('#CMSL_confirmYesBtn').click(function(){
		$('#CMSL_messageCover').fadeOut(200, callback);
		unfreezeBody(1);
	});
	$('#CMSL_confirmNoBtn').click(function(){
		$('#CMSL_messageCover').fadeOut(200);
		unfreezeBody(1);
	});
	$('#CMSL_alertCloseIcon').click(function(){
		$('#CMSL_messageCover').fadeOut(200);
		unfreezeBody(1);
	});
	$('#CMSL_alertMessage').html(message); 
	
	freezeBody(1);
	
	$('#CMSL_messageCover').fadeIn(100,function(){
			$('#CMSL_alertContainer').fadeIn(100);
	});
}


function CMSL_popupWindow(title,url,param,init) {
// Выводит всплывающее окно
// с указанным заголовком. Внутренняя часть окна 
// загружается из УРЛ.
// title - заголовок диалогового окна
// param - параметры, передаваемые модулю get-запросом
// init - js функция, которая проинициализирует окно после загрузки,
// например, если там есть поля с масками или ещё что.
	if(!$('#CMSL_messageCover').length) {
		$('body').append('<div id="CMSL_messageCover"></div>');
	}
	$('#CMSL_messageCover').html('<div id="CMSL_alertOuter"><div id="CMSL_alertInner"><div id="CMSL_alertContainer"><div class="CMSL_windowCaption">'+title+'</div><div id="CMSL_alertCloseIcon"></div><div id="CMSL_reload"></div></div></div>');
	$('#CMSL_alertCloseIcon').click(function(){
		$('#CMSL_messageCover').fadeOut(200);
		unfreezeBody(1);
	});
	
	
	$.get(url,param,function(html){
		$('#CMSL_reload').html(html); 
		// initButtons('#CMSL_reload');
		freezeBody(1);
		$('#CMSL_messageCover').fadeIn(100,function(){
			$('#CMSL_alertContainer').fadeIn(100,function(){
				if(init != null){ init(); }
			});
		});

	});
}


function freezeBody(deep){
	if(!$('body').hasClass('freeze'+deep)){
		$('body').addClass('freeze'+deep);
		$('html').addClass('freeze'+deep);
	}
}

function unfreezeBody(deep){
	if($('body').hasClass('freeze'+deep)){
		$('body').removeClass('freeze'+deep);
		$('html').removeClass('freeze'+deep);
	}
}


function getAllUrlParams(url) {

  // извлекаем строку из URL или объекта window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // объект для хранения параметров
  var obj = {};

  // если есть строка запроса
  if (queryString) {

    // данные после знака # будут опущены
    queryString = queryString.split('#')[0];

    // разделяем параметры
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // разделяем параметр на ключ => значение
      var a = arr[i].split('=');

      // обработка данных вида: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // передача значения параметра ('true' если значение не задано)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // преобразование регистра
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // если ключ параметра уже задан
      if (obj[paramName]) {
        // преобразуем текущее значение в массив
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // если не задан индекс...
        if (typeof paramNum === 'undefined') {
          // помещаем значение в конец массива
          obj[paramName].push(paramValue);
        }
        // если индекс задан...
        else {
          // размещаем элемент по заданному индексу
          obj[paramName][paramNum] = paramValue;
        }
      }
      // если параметр не задан, делаем это вручную
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}