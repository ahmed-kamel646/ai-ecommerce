package com.ahmed.ecommerce.common;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Arrays;

public class DoubleArrayUserType implements UserType<double[]> {

    @Override
    public int getSqlType() {
        return Types.ARRAY;
    }

    @Override
    public Class<double[]> returnedClass() {
        return double[].class;
    }

    @Override
    public boolean equals(double[] x, double[] y) {
        return Arrays.equals(x, y);
    }

    @Override
    public int hashCode(double[] x) {
        return Arrays.hashCode(x);
    }

    @Override
    public double[] nullSafeGet(ResultSet rs, int position,
                                SharedSessionContractImplementor session, Object owner) throws SQLException {
        Array array = rs.getArray(position);
        if (array == null || rs.wasNull()) return null;
        Object raw = array.getArray();
        if (raw instanceof Double[] boxed) {
            double[] out = new double[boxed.length];
            for (int i = 0; i < boxed.length; i++) out[i] = boxed[i] == null ? 0.0 : boxed[i];
            return out;
        }
        if (raw instanceof double[] prim) return prim.clone();
        throw new SQLException("Unexpected array element type: " + raw.getClass());
    }

    @Override
    public void nullSafeSet(PreparedStatement st, double[] value, int index,
                            SharedSessionContractImplementor session) throws SQLException {
        if (value == null) {
            st.setNull(index, Types.ARRAY);
            return;
        }
        Double[] boxed = new Double[value.length];
        for (int i = 0; i < value.length; i++) boxed[i] = value[i];
        Array array = st.getConnection().createArrayOf("float8", boxed);
        st.setArray(index, array);
    }

    @Override
    public double[] deepCopy(double[] value) {
        return value == null ? null : value.clone();
    }

    @Override
    public boolean isMutable() {
        return true;
    }

    @Override
    public Serializable disassemble(double[] value) {
        return value == null ? null : value.clone();
    }

    @Override
    public double[] assemble(Serializable cached, Object owner) {
        return cached == null ? null : ((double[]) cached).clone();
    }

    @Override
    public double[] replace(double[] detached, double[] managed, Object owner) {
        return deepCopy(detached);
    }
}
