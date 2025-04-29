---
title: Vue重学计划（四）
published: 2024-10-10
image: ./vue.png
description: 简单把Computed总结一下
tags: [Vue,前端,源码]
category: Vue重学计划
draft: false
---
今天状态不错，再写一篇，这样把之前欠的也算补回来了一点。

简单把Computed总结一下

# Computed用法

computedDemo.vue

```html
<template>
    <form>
        <input type="text" v-model="firstName" />
        <br>
        <label>First Name:{{ firstName }}</label>
        <br>
        <input type="text" v-model="lastName" />
        <br>
        <label>Last Name:{{ lastName }}</label>
        <p>Full Name: {{ fullName }}</p>
        <button @click.prevent="submit">submit</button>
    </form>
    <hr>
    <form>
        <input type="text" v-model="upperBody" />
        <br>
        <label>Upper Body:{{ upperBody }}</label>
        <br>
        <input type="text" v-model="lowerBody" />
        <br>
        <label>Lower Body:{{ lowerBody }}</label>
        <p>People: {{ people }}</p>
        <button @click.prevent="createPerson">create person</button>
    </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
//  函数式写法 getter + private setter
const firstName = ref('')
const lastName = ref('')
const fullName = computed<string>(() => `${firstName.value} ${lastName.value}`)
const submit = () => {
    console.log(fullName.value)
}

//  对象式写法 getter + setter
const upperBody = ref('')
const lowerBody = ref('')
let people = computed<string>({
    get() {
        return `${upperBody.value} ${lowerBody.value}`
    },
    set(newVal) {
        [upperBody.value, lowerBody.value] = newVal.split(' ')
    }
})
const createPerson = () => {
    people.value = '五条 悟'
}
</script>

<style lang="css" scoped></style>
```

这里面比较重要的就是computed的对象式写法，对象式写法需要在computed的参数中传入一个含有getter和setter的对象。

常规的函数式写法的优势就是简明，使用对象式写法的优势是可以调用setter进行特殊处理，不过简单的开发里面很难用上就是了。

# Computed实例

computedDemo2.vue

```html
<template>
    <div>
        <input v-model="searchText" placeholder="Search..." type="text">
    </div>
    <div style="margin-top: 20px;">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Passed</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in searchData">
                    <td align="center">{{ item.id }}</td>
                    <td align="center">{{ item.name }}</td>
                    <td align="center">
                        <button @click="item.grade < 100 ? item.grade++ : ''">+</button>
                        {{ item.grade }}
                        <button @click="item.grade > 0 ? item.grade-- : ''">-</button>
                    </td>
                    <td align="center">
                        {{ item.grade >= 60 ? 'Yes√' : 'No×' }}
                    </td>
                    <td align="center">
                        <button @click="deleteItem(item)">Delete</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" align="center">
                        通过的学生数：{{ total }}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
let searchText = ref<string>('')
interface Student {
    id: number,
    name: string,
    grade: number
}
let data = reactive<Student[]>([
    {
        id: 1,
        name: 'Tom',
        grade: 90
    },
    {
        id: 2,
        name: 'Jerry',
        grade: 80
    },
    {
        id: 3,
        name: 'Lily',
        grade: 70
    },
    {
        id: 4,
        name: 'Lucy',
        grade: 60
    },
    {
        id: 5,
        name: 'Mary',
        grade: 50
    },
    {
        id: 6,
        name: 'FurryMonster',
        grade: 0
    }
])
const searchData = computed(() => {
    return data.filter((item: Student) => {
        return item.name.includes(searchText.value)
    })
})
function deleteItem(item: Student) {
    data.splice(data.indexOf(item), 1)
}
// const total = () => {
//     $total.value = data.reduce((prev: number, next: Student) => {
//         return prev + Math.floor(next.grade / 60)
//     }, 0)
// }
const total = computed(() => {
    return searchData.value.reduce((prev: number, next: Student) => {
        return prev + Math.floor(next.grade / 60)
    }, 0)
})
</script>

<style lang="css" scoped></style>
```

使用computed对searchData和total进行代理，双向绑定让我们不需要每次对每次重新渲染的时候都手动调用函数，函数的调用在绑定后由框架代理，能让我们更集中在业务逻辑的实现上.

# Computed源码

Computed源码比较简单，网上有很多源码解析版本很老了，Computed还是那种使用effect实现的版本，当前版本的vue3的computed早就不使用effect了，后面会专门出一期Vue3响应式的源码重写，这里就不多bb了
