import http from '@ohos.net.http';
import router from '@ohos.router'

let httpRequest = http.createHttp();

interface ExpressState {
  time: string
  content: string
}

interface ListExpress {
  number: string
  comName: string
  updateTime: string
  isExpressed: boolean
  list: ExpressState[]
}

@Entry
@Component
struct Index {
  @State ExpressingList: ListExpress[] = AppStorage.SetAndLink('ExpressingList', []).get()
  @State ExpressedList: ListExpress[] = AppStorage.SetAndLink('ExpressedList', []).get()

  build() {
    Column() {
      Search({ placeholder: '输入快递单号' })
        .searchButton('搜索')
        .height(40)
        .margin(20)
        .onSubmit((value: string) => {
          httpRequest.request("https://apis.tianapi.com/kuaidi/index?key=15313ae68020f1862cf4fb6a4d284245&number=" + value, {
            header: {
              'Content-Type': 'application/json'
            }
          }).then((data) => {
            console.info('Result:' + data.result);
            const res = JSON.parse(<string> data.result);
            let item: ListExpress = {
              number: value,
              comName: res.result.kuaidiname,
              updateTime: res.result.updatetime,
              isExpressed: res.result.status>=4,
              list: res.result.list
            }
            console.log(JSON.stringify(item))
            if (item.isExpressed) {
              this.ExpressedList.push(item);
              AppStorage.Set('ExpressedList', this.ExpressedList);
            } else {
              this.ExpressingList.push(item);
              AppStorage.Set('ExpressingList', this.ExpressingList);
            }
          }).catch((err) => {
            console.info('error:' + JSON.stringify(err));
          });
        })
      Tabs({ barPosition: BarPosition.Start }) {
        TabContent() {
          Column() {
            List({ space: 10, initialIndex: 0 }) {
              ForEach(this.ExpressingList, (item, index) => {
                ListItem() {
                  Row() {
                    Image($r("app.media.express"))
                      .margin({ top: 10, bottom: 10, right: 10 })
                      .height(54)
                    Column() {
                      Text(item.comName)
                        .fontSize(16)
                        .fontWeight(FontWeight.Bold)
                      Text(item.number)
                        .fontSize(12)
                      Text(item.list[0].content)
                        .fontSize(12)
                        .maxLines(2)
                      Text(item.updateTime)
                        .fontSize(12)
                    }
                    .flexShrink(1)
                    .justifyContent(FlexAlign.Center)
                    .alignItems(HorizontalAlign.Start)
                  }
                  .width('100%')
                  .borderRadius(10)
                  .padding(10)
                  .backgroundColor('#fff')
                }
                .width('100%')
                .onClick(() => {
                  AppStorage.SetOrCreate('Express', item);
                  router.pushUrl({
                    url: 'pages/Detail'
                  })
                })
              }, item => item)
            }
            .padding(10)
          }.width('100%').height('100%')
        }.tabBar(`未签收`)

        TabContent() {
          Column() {
            List({ space: 10, initialIndex: 0 }) {
              ForEach(this.ExpressedList, (item, index) => {
                ListItem() {
                  Row() {
                    Image($r("app.media.express"))
                      .margin({ top: 10, bottom: 10, right: 10 })
                      .height(54)
                    Column() {
                      Text(item.comName)
                        .fontSize(16)
                        .fontWeight(FontWeight.Bold)
                      Text(item.number)
                        .fontSize(12)
                      Text(item.list[0].content)
                        .fontSize(12)
                        .maxLines(2)
                      Text(item.updateTime)
                        .fontSize(12)
                    }
                    .flexShrink(1)
                    .justifyContent(FlexAlign.Center)
                    .alignItems(HorizontalAlign.Start)
                  }
                  .width('100%')
                  .borderRadius(10)
                  .padding(10)
                  .backgroundColor('#fff')
                }
                .width('100%')
                .onClick(() => {
                  AppStorage.SetOrCreate('Express', item);
                  router.pushUrl({
                    url: 'pages/Detail'
                  })
                })
              }, item => item)
            }
            .padding(10)
          }.width('100%').height('100%')
        }.tabBar(`已签收`)
      }
      .barHeight(48)
      .backgroundColor('#F1F3F5')
      .flexShrink(1)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Start)
  }
}