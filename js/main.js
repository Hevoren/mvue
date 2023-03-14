let eventBus = new Vue()

Vue.component('all-notes', {
    template:`
            <div class="all-notes">
                <create-note></create-note>
                <notes></notes>
            </div>
    `,
})

Vue.component('notes', {
    template: `
        <div class="notes">
            <note :column="column_1" :errors="errors_1" :name="nameFirst" @changeTask="changeTask" ></note>
            <note :column="column_2" :errors="errors_2" :name="nameSecond" @changeTask="changeTask"></note>
            <note :column="column_3" :errors="errors_3" :name="nameThird"></note>
        </div>
    `,

    data() {
        return {
            column_1: [],
            column_2: [],
            column_3: [],

            errors_1: [],
            errors_2: [],
            errors_3: [],

            nameFirst: 'Begin',
            nameSecond: 'Continue',
            nameThird: 'End',

            changeTaskArr: [],

        }
    },
    // mounted - вызывается после того, как компонент был добавлен в DOM, т.е. србатывает после того как даннные улетели из формы сюда.
    // после чего он пытается достать и разобрать строку json из localstorage, и если ее нет, присваивает пустой массив
    mounted(){
        eventBus.$on('notes-submitted', note => {
            this.errors_1 = []
            if (this.column_1.length < 3){
                this.column_1.push(note);
                this.saveNote_1();
            } else {
                this.errors_1.push('GABELLA! Maximum count of tasks!');
            }
        })
    },
    // watch отслеживает изменения, если они есть, то он присваивает и сохраняет новые значения, добавляя их в localstorage и преобразовывая ('stringify') в json формат
    watch: {
        column_1(newValue) {
            localStorage.setItem("column_1", JSON.stringify(newValue));
        },
        column_2(newValue) {
            localStorage.setItem("column_2", JSON.stringify(newValue));
        },
        column_3(newValue) {
            localStorage.setItem("column_3", JSON.stringify(newValue));
        },
    },
    // saveNote вызывается после выполнения mounted; присваивает и сохраняет значения в localstorage, преобразовывая ('stringify') их в json формат
    methods: {
        saveNote_1(){
            localStorage.setItem('column_1', JSON.stringify(this.column_1));
        },
        saveNote_2(){
            localStorage.setItem('column_2', JSON.stringify(this.column_2));
        },
        saveNote_3(){
            localStorage.setItem('column_3', JSON.stringify(this.column_3));
        },
        changeTask(task) {
            let count = 0;
            let countColumn_2 = 0;
            this.column_1[task.indexNote].tasks[task.indexTask].readiness = !this.column_1[task.indexNote].tasks[task.indexTask].readiness;
            const currentDateTime = new Date();

            for(let i = 0; i < this.column_1[task.indexNote].tasks.length; i++){
                if (this.column_1[task.indexNote].tasks[i].name !== null) {
                    count++;
                }
            }
            console.log("count", count)
            for (let i = 0; i < this.column_1[task.indexNote].tasks.length; i++) {
                if (this.column_1[task.indexNote].tasks[i].readiness === true) {
                    countColumn_2 += 1;
                }
            }
            console.log("countColumn_2", countColumn_2)
            if (countColumn_2 / count * 100 >= 50 && this.column_2.length < 5) {
                this.column_2.push(this.column_1[task.indexNote]);
                this.column_1.splice(task.indexNote, 1);
            }
            if (countColumn_2 === count && this.column_3.length < 5) {
                const note = this.column_2[task.indexNote];
                note.datetime = currentDateTime;
                this.column_3.push(note);
                this.column_2.splice(task.indexNote, 1);
            }
            console.log(this.changeTaskArr)
        },


    }

})

Vue.component('note', {
    props: {
        column: {
            type: Array,
            required: true,

        },
        errors: {
            type: Array,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    },

    template: `
        <div>
            <p>{{ name }}</p>
            <div class="note">
                <h1 v-for="error in errors"> {{ error }}</h1>
                <ul>
                    <li v-for="(note, indexNote) in column" class="li-list">
                        <h1>{{ note.name }}</h1>
                        <ul>
                            <li v-for="(task, indexTask) in note.tasks" class="li-task" v-if="task.name !== null" >
                                <p>{{ task.name }}</p>
                                <input type="checkbox" @change="changeKeyTask(indexNote, indexTask, name)">
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    `,

    methods: {
        changeKeyTask(indexNote, indexTask, name){
            this.$emit('changeTask', {indexNote, indexTask, name})
        },


    }
})

Vue.component('create-note', {
    template: `
        <div class="createNote">
            <form class="createForm" @submit.prevent="onSubmit">
                <p v-if="errors" v-for="error in errors">{{ error }}</p>
                <input type="text" placeholder="Name" id="name" v-model="name" required maxlength="10">
                <input type="text" placeholder="Task 1" id="task_1" v-model="task_1" maxlength="10">
                <input type="text" placeholder="Task 2" id="task_2" v-model="task_2" maxlength="10">
                <input type="text" placeholder="Task 3" id="task_3" v-model="task_3" maxlength="10">
                <input type="text" placeholder="Task 4" id="task_4" v-model="task_4" maxlength="10">
                <input type="text" placeholder="Task 5" id="task_5" v-model="task_5" maxlength="10">
                <button type="submit">Create</button>
            </form>
        </div>  
    `,

    data() {
        return{
            name: null,
            task_1: null,
            task_2: null,
            task_3: null,
            task_4: null,
            task_5: null,
            id: 0,
            all_tasks: [],
            errors: []
        }
    },

    methods: {
        onSubmit() {
            this.all_tasks = []
            this.errors = []
            this.all_tasks.push(this.task_1, this.task_2, this.task_3, this.task_4, this.task_5)
            this.all_tasks = this.all_tasks.filter(Boolean)
            if (this.all_tasks.length >= 3 ){
                let note = {
                    name: this.name,
                    tasks: [
                        {name: this.task_1, readiness: false},
                        {name: this.task_2, readiness: false},
                        {name: this.task_3, readiness: false},
                        {name: this.task_4, readiness: false},
                        {name: this.task_5, readiness: false},
                    ],
                    id:this.id,
                    status: 0
                }
                this.idUp()
                eventBus.$emit('notes-submitted', note);
                this.name = null;
                this.task_1 = null;
                this.task_2 = null;
                this.task_3 = null;
                this.task_4 = null;
                this.task_5 = null;
            }else {
                this.all_tasks = []
                this.errors.push("GABELLA! From 3 to 5 tasks!")
            }
        },
        idUp(){
            this.id++
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {
        name: 'Notes',
    }
})