<template>
  <div class="grid">
    <div class="col-12">
      <div class="card flex flex-column align-items-center">
        <div>
        </div>
        <div class="p-fluid w-full lg:w-8">
          <div class="formgrid grid">
            <div class="field col">
              <label for="name2">Name</label>
              <InputText id="name2" type="text"/>
            </div>
            <div class="field col">
              <label for="email2">Last Name</label>
              <InputText id="email2" type="text"/>
            </div>
          </div>
          <div class="formgrid grid">
            <div class="field col">
              <label for="name2">Personal Email</label>
              <InputText id="name2" type="text"/>
            </div>
            <div class="field col">
              <label for="email2">Phone</label>
              <InputText id="email2" type="text"/>
            </div>
          </div>
          <div class="formgrid grid">
            <div class="field col">
              <label for="name2">User</label>
              <InputText id="name2" type="text"/>
            </div>
            <div class="field col">
              <label for="email2">Password</label>
              <Password id="password1" v-model="password" placeholder="****************" :toggleMask="true"
                        inputClass="w-full"></Password>
            </div>
          </div>
        </div>
        <div>
          <Button label="Save Changes" class="mr-2 mb-2"></Button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
</script>

<style scoped>
</style>
