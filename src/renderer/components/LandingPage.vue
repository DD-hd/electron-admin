<template>
  <div class="wrapper">
    <header class="box-center header">
      <div class="img-logo">
        <img src="~@/assets/logo.png" alt="electron-vue" class="img-auto">
      </div>
      <div class="box-btn">
        <button class="btn-default" @click="uploadFile">上传文件</button>
        <button class="btn-default" @click="downloadTemplate">下载模板</button>
        <div class="btn-search">
          <input type="text" class="search-input" v-model="tname">
          <button class="btn-default" @click="searchBody">搜索</button>
        </div>
      </div>
    </header>

    <main class="box-main box-center">
      <table border="1" class="main-table">
        <thead v-if="hasTitle">
          <tr>
            <th v-for="(value,key) in title" :key="key" colspan="2">{{value}}</th>
          </tr>
        </thead>
        <tbody v-if="hasBody">
          <tr v-for="(item,index) in body" :key="index">
            <td v-for="(value,key) in item" :key="key" colspan="2">{{value}}</td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script>
import nodeXlsx from 'node-xlsx'
import { insertData, selectData, selectDataByName } from '../../service/index'
import {remote} from 'electron'
import fse from 'fs-extra'
import path from 'path'

const {dialog} = remote

export default {
  name: 'landing-page',
  data () {
    return {
      title: ['id', '名字', '性别'],
      body: [],
      file: null,
      eleFile: null,
      tname: ''
    }
  },
  computed: {
    hasTitle () {
      return !!this.title.length
    },
    hasBody () {
      return !!this.body.length
    }
  },
  methods: {
    checkFileEle (func) {
      if (this.eleFile) {
        return this.eleFile
      }
      const ele = document.createElement('input')
      ele.type = 'file'
      ele.style = 'display:none;'
      this.eleFile = ele
      document.body.appendChild(ele)
      ele.addEventListener('change', func)
      return this.eleFile
    },
    uploadFile () {
      const ele = this.checkFileEle(() => {
        this.file = this.eleFile.files[0]
        const reader = new FileReader()
        reader.onload = async e => {
          const res = reader.result
          const buffer = Buffer.from(res)
          const sheets = nodeXlsx.parse(buffer)
          const records = sheets.length > 0 && sheets[0].data.slice(1)
          if (records.length > 0) {
            await this.insertRecord(records)
            await this.reloadBody()
          }
        }
        reader.readAsArrayBuffer(this.file)
      })
      ele.click()
    },
    async insertRecord (item) {
      return insertData(item)
    },
    async selectData () {
      const records = await selectData()
      return records
    },

    async selectDataByName (name) {
      const records = await selectDataByName(name)
      return records
    },

    async reloadBody () {
      this.body = await this.selectData()
    },

    async searchBody () {
      this.body = await this.selectDataByName(this.tname)
    },

    async downloadTemplate () {
      const options = {
        title: '下载模板',
        defaultPath: '~/' + '导入模板',
        filters: [
          { name: 'Sheets', extensions: ['csv', 'xlsx', 'xsl'] }
        ]
      }
      dialog.showSaveDialog(options, async filename => {
        if (filename) {
          const data = await fse.readFile(path.resolve(__static, './template/teacher.template.csv'))
          await fse.writeFile(filename, data)
        }
      })
    }
  },
  mounted () {
    this.reloadBody()
  }
}
</script>

<style>
/* @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro"); */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.box-main {
  width: 480px;
}

.main-search-box {
  position: relative;
}

.btn-search {
  position: absolute;
  top: 0;
  right: 0;
}
.search-input {
  padding: 8px;
}

.main-table {
  width: 100%;
  background-color: #a09e9e;
  text-align: center;
}

.main-table tr,
th {
  min-height: 36px;
  min-width: 80px;
}

.box-center {
  margin: 0 auto;
}
.box-btn {
  margin-top: 16px;
  position: relative;
}

.btn-default {
  min-width: 80px;
  height: 36px;
  background-color: rgb(255, 255, 255);
  border: 1px solid #a09e9e;
  border-radius: 6px;
  display: inline-block;
  outline: none;
}

.btn-default:active {
  background-color: green;
}

.header {
  width: 480px;
}
.wrapper {
  padding-top: 24px;
}

.img-logo {
  height: 240px;
}

.img-auto {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
