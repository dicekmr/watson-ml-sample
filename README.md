# Conversation サンプルアプリケーション
このアプリケーションはWatson Conversationで作ったDialogを簡単に動かすためのものです。

デモ画面  
![デモ](readme_images/conv-sample2.gif)

## 事前準備

* Bluemixアカウントの準備
    * [Bluemixアカウントを作る][sign_up] か、あるいは既存のBluemixアカウントを利用します。
* 次の前提ソフトを導入します。
    *  [git][git] コマンドラインツール
    *  [Cloud Foundry][cloud_foundry] コマンドラインツール

      注意: Cloud Foundaryのバージョンは最新として下さい。

### ソースのダウンロード
カレントディレクトリのサブディレクトリにソースはダウンロードされるので、あらかじめ適当なサブディレクトリを作り、そこにcdしておきます。

    git clone https://git.ng.bluemix.net/akaishi/conv-ui-sample.git

### Bluemix環境へのデプロイ
cf loginコマンドではemailとpasswordを聞かれるのでbluemix登録時のemailアドレスとパスワードを指定します。  
cf pushコマンドで指定する<your_appl_name>はBluemix上のインスタンス名であると同時に、インターネット上のURL名にもなるので、ユニークなものを指定します。  

    cd conv-ui-sample
    cf login
    cf push <your_appl_name>

### 環境変数の確認
以下の3つの環境変数の値を調べます。
  
 CONVERSATION_USERNAME  
 CONVERSATION_PASSWORD  
 WORKSPACE_ID  
  
USERNAMEとPASSWORDは、Conversationサービス管理画面から「資格情報」「資格情報の表示」を選択  
  
![userid](readme_images/conv-userid.png)
  
WORDSPACE_IDは、Conversaionサービス管理画面から「Launch Tool」ワークスペースごとの詳細メニューから
「View Deatails」を選択  
  
![workspace](readme_images/conv-workspaceid.png)
  
### 環境変数のセット
３つの環境変数の値をCloudFoundary管理画面から、「ランタイム」「環境変数」を選択して設定します。
  
![setting](readme_images/env-settings.png)

### アプリケーションのURLと起動
環境変数を保存すると自動的に再構成が動き出します。  
しばらくしてこれが完了したら、下記の画面で該当するCloud Foundaryアプリケーションの「経路」のリンクをクリックするとアプリケーションが起動されます。

![call-appl](readme_images/call-appl.png)


[node_js]: https://nodejs.org/#download
[cloud_foundry]: https://github.com/cloudfoundry/cli#downloads
[git]: https://git-scm.com/downloads
[npm_link]: https://www.npmjs.com/
[sign_up]: https://bluemix.net/registration
[demo]: https://git.ng.bluemix.net/akaishi/conv-ui-sample/blob/master/readme_images/conv-sample2.gif